export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

      {/* Avatar + identity */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 rounded-full bg-[#1c1c1c] border border-white/10 flex items-center justify-center text-white/30 text-2xl font-bold">
          T
        </div>
        <div>
          <p className="text-white font-semibold text-lg">TestUser</p>
          {/* TODO: fetch real user ENS name */}
          {/* TODO: connect MetaMask wallet */}
          <p className="text-white/40 font-mono text-sm">0x1a2b...3c4d</p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="rounded-xl bg-[#1c1c1c] border border-white/5 p-6 mb-4">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Purchase History</p>
        <p className="text-white/20 text-sm">No purchases yet</p>
      </div>

      {/* Agent Settings */}
      <div className="rounded-xl bg-[#1c1c1c] border border-white/5 p-6">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Agent Settings</p>
        <p className="text-white/20 text-sm">Configure your agent preferences</p>
      </div>
    </div>
  );
}
