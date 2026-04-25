// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

library SafeERC20 {
    error SafeERC20FailedOperation();

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        (bool success, bytes memory data) =
            address(token).call(abi.encodeCall(token.transfer, (to, value)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert SafeERC20FailedOperation();
        }
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) =
            address(token).call(abi.encodeCall(token.transferFrom, (from, to, value)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert SafeERC20FailedOperation();
        }
    }
}

contract AvalanchePaymentEscrowRouter {
    using SafeERC20 for IERC20;

    enum PaymentStatus {
        None,
        Paid,
        ReleasedForOffRamp,
        Refunded
    }

    struct Payment {
        address payer;
        address merchant;
        uint256 amount;
        uint64 paidAt;
        PaymentStatus status;
        bytes32 sourceTxId;
    }

    IERC20 public immutable usdc;
    address public owner;
    bool public paused;
    uint256 public accountedBalance;

    mapping(address => bool) public operators;
    mapping(address => bool) public offRampSettlementWallets;
    mapping(bytes32 => Payment) public payments;

    uint256 private locked = 1;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OperatorSet(address indexed operator, bool allowed);
    event OffRampSettlementWalletSet(address indexed wallet, bool allowed);
    event PausedSet(bool paused);
    event PaymentRegistered(
        bytes32 indexed orderId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        bytes32 sourceTxId
    );
    event PaymentReleasedForOffRamp(
        bytes32 indexed orderId,
        address indexed merchant,
        address indexed settlementWallet,
        uint256 amount
    );
    event PaymentRefunded(bytes32 indexed orderId, address indexed payer, uint256 amount);

    error NotOwner();
    error NotOperator();
    error Paused();
    error ReentrantCall();
    error InvalidAddress();
    error InvalidAmount();
    error InvalidOrderId();
    error PaymentAlreadyExists();
    error PaymentNotPaid();
    error SettlementWalletNotAllowed();
    error InsufficientUnaccountedBalance();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOperator() {
        if (!operators[msg.sender] && msg.sender != owner) revert NotOperator();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    modifier nonReentrant() {
        if (locked != 1) revert ReentrantCall();
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address usdc_, address owner_) {
        if (usdc_ == address(0) || owner_ == address(0)) revert InvalidAddress();
        usdc = IERC20(usdc_);
        owner = owner_;
        emit OwnershipTransferred(address(0), owner_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        if (operator == address(0)) revert InvalidAddress();
        operators[operator] = allowed;
        emit OperatorSet(operator, allowed);
    }

    function setOffRampSettlementWallet(address wallet, bool allowed) external onlyOwner {
        if (wallet == address(0)) revert InvalidAddress();
        offRampSettlementWallets[wallet] = allowed;
        emit OffRampSettlementWalletSet(wallet, allowed);
    }

    function setPaused(bool paused_) external onlyOwner {
        paused = paused_;
        emit PausedSet(paused_);
    }

    /// @notice Preferred settlement path for routers that can execute a destination call.
    /// @dev The cross-chain router must approve this contract for `amount` USDC before calling.
    function payOrder(
        bytes32 orderId,
        address payer,
        address merchant,
        uint256 amount,
        bytes32 sourceTxId
    ) external nonReentrant whenNotPaused {
        _validateNewPayment(orderId, payer, merchant, amount);
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        _recordPayment(orderId, payer, merchant, amount, sourceTxId);
    }

    /// @notice Reconciliation path when a bridge sends USDC directly to this contract.
    /// @dev Operator must verify source and destination transaction evidence off-chain first.
    function recordBridgedPayment(
        bytes32 orderId,
        address payer,
        address merchant,
        uint256 amount,
        bytes32 sourceTxId
    ) external onlyOperator whenNotPaused {
        _validateNewPayment(orderId, payer, merchant, amount);
        uint256 unaccounted = usdc.balanceOf(address(this)) - accountedBalance;
        if (unaccounted < amount) revert InsufficientUnaccountedBalance();
        _recordPayment(orderId, payer, merchant, amount, sourceTxId);
    }

    function releaseForOffRamp(bytes32 orderId, address settlementWallet)
        external
        onlyOperator
        nonReentrant
        whenNotPaused
    {
        if (!offRampSettlementWallets[settlementWallet]) revert SettlementWalletNotAllowed();
        Payment storage payment = payments[orderId];
        if (payment.status != PaymentStatus.Paid) revert PaymentNotPaid();

        payment.status = PaymentStatus.ReleasedForOffRamp;
        accountedBalance -= payment.amount;
        usdc.safeTransfer(settlementWallet, payment.amount);

        emit PaymentReleasedForOffRamp(orderId, payment.merchant, settlementWallet, payment.amount);
    }

    function refund(bytes32 orderId, address refundTo) external onlyOperator nonReentrant {
        if (refundTo == address(0)) revert InvalidAddress();
        Payment storage payment = payments[orderId];
        if (payment.status != PaymentStatus.Paid) revert PaymentNotPaid();

        payment.status = PaymentStatus.Refunded;
        accountedBalance -= payment.amount;
        usdc.safeTransfer(refundTo, payment.amount);

        emit PaymentRefunded(orderId, refundTo, payment.amount);
    }

    function getPayment(bytes32 orderId) external view returns (Payment memory) {
        return payments[orderId];
    }

    function _validateNewPayment(
        bytes32 orderId,
        address payer,
        address merchant,
        uint256 amount
    ) private view {
        if (orderId == bytes32(0)) revert InvalidOrderId();
        if (payer == address(0) || merchant == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (payments[orderId].status != PaymentStatus.None) revert PaymentAlreadyExists();
    }

    function _recordPayment(
        bytes32 orderId,
        address payer,
        address merchant,
        uint256 amount,
        bytes32 sourceTxId
    ) private {
        payments[orderId] = Payment({
            payer: payer,
            merchant: merchant,
            amount: amount,
            paidAt: uint64(block.timestamp),
            status: PaymentStatus.Paid,
            sourceTxId: sourceTxId
        });
        accountedBalance += amount;
        emit PaymentRegistered(orderId, payer, merchant, amount, sourceTxId);
    }
}
