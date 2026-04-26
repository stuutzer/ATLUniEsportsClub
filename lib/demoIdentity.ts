export const DEMO_ENS_NAME = "jack.eth";
export const DEMO_ENS_AVATAR = "/quarter.png";

export function getAgentIdentityRoot(ensName: string | null) {
  return (ensName ?? DEMO_ENS_NAME).trim().toLowerCase();
}

export function resolveDemoIdentity(address: string | null, ensName: string | null) {
  if (!address) {
    return {
      ensName: null,
      ensAvatar: null,
    };
  }

  return {
    ensName: ensName ?? DEMO_ENS_NAME,
    ensAvatar: DEMO_ENS_AVATAR,
  };
}
