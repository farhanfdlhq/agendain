import { CheckCircle2 } from "lucide-react"

interface PasswordValidatorProps {
  password?: string;
}

export function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*]/.test(password),
  }
}

export function isPasswordValid(password: string) {
  const v = validatePassword(password);
  return v.length && v.lowercase && v.uppercase && v.number && v.symbol;
}

export default function PasswordValidator({ password = "" }: PasswordValidatorProps) {
  if (!password) return null; // Tampilkan hanya ketika pengguna mulai mengetik

  const v = validatePassword(password);
  const criteria = [
    { label: "Minimal 8 karakter", met: v.length },
    { label: "Terdapat minimal satu huruf kecil", met: v.lowercase },
    { label: "Terdapat minimal satu huruf besar", met: v.uppercase },
    { label: "Terdapat minimal satu angka", met: v.number },
    { label: "Terdapat salah satu simbol: ! @ # $ % ^ & *", met: v.symbol }
  ];

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3.5 text-xs md:text-sm shadow-sm transition-all duration-300">
      {criteria.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2.5">
          <CheckCircle2 className={`h-[18px] w-[18px] transition-colors duration-300 ${item.met ? "text-emerald-500" : "text-muted-foreground/30"}`} />
          <span className={`transition-colors duration-300 ${item.met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
