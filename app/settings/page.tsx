const sections = [
  { title: "Account", description: "Manage your account details and preferences" },
  { title: "Notifications", description: "Control how and when you receive notifications" },
  { title: "Security", description: "Manage passwords, two-factor auth, and sessions" },
  { title: "Payments", description: "Configure payment methods and crypto wallets" },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-4">
        {sections.map(({ title, description }) => (
          <div key={title} className="rounded-xl bg-[#1c1c1c] border border-white/5 p-6">
            <p className="text-white font-semibold mb-1">{title}</p>
            <p className="text-white/40 text-sm">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
