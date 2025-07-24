import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { PasswordStrength } from '@/lib/security';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export function PasswordStrengthIndicator({ strength, password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'hsl(var(--destructive))';
    if (score < 4) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span 
          className="font-medium"
          style={{ color: getStrengthColor(strength.score) }}
        >
          {getStrengthText(strength.score)}
        </span>
      </div>
      
      <Progress 
        value={(strength.score / 4) * 100} 
        className="h-2"
        style={{ 
          backgroundColor: 'hsl(var(--muted))',
        }}
      />
      
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <X className="h-3 w-3 text-destructive" />
              <span>{feedback}</span>
            </div>
          ))}
        </div>
      )}
      
      {strength.isStrong && (
        <div className="flex items-center gap-2 text-xs text-success">
          <Check className="h-3 w-3" />
          <span>Password meets security requirements</span>
        </div>
      )}
    </div>
  );
}