const sections = [
  { title: "Account", description: "Manage your account details and preferences" },
  { title: "Notifications", description: "Control how and when you receive notifications" },
  { title: "Security", description: "Manage passwords, two-factor auth, and sessions" },
  { title: "Payments", description: "Configure payment methods and crypto wallets" },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white mb-7">Settings</h1>
      <div className="space-y-4">
        {sections.map(({ title, description }) => (
          <div key={title} className="rounded-xl bg-[#141414] border border-white/[0.07] p-6">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">{title}</p>
            <p className="text-white/60 text-sm">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}