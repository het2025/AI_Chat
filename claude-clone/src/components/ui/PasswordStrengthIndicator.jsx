import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff, Check, X } from "lucide-react";

/**
 * @typedef {"empty" | "weak" | "medium" | "strong" | "very-strong"} StrengthLevel
 */

// Password strength calculation based on common rules
const calculateStrength = (password) => {
  if (!password) return { score: 0, level: "empty" };
  
  let score = 0;
  
  // Length check
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  /** @type {StrengthLevel} */
  let level = "empty";
  if (score === 0) level = "empty";
  else if (score <= 2) level = "weak";
  else if (score <= 4) level = "medium";
  else if (score <= 5) level = "strong";
  else level = "very-strong";
  
  return { score, level };
};

// Colors for different strength levels
const strengthColors = {
  empty: "bg-gray-200",
  weak: "bg-red-500",
  medium: "bg-orange-500",
  strong: "bg-green-500",
  "very-strong": "bg-emerald-500",
};

// Text labels for different strength levels
const strengthLabels = {
  empty: "Empty",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  "very-strong": "Very Strong",
};

export function PasswordStrengthIndicator({
  value,
  className,
  label = "Password",
  showScore = true,
  showScoreNumber = false,
  onChange,
  onStrengthChange,
  placeholder = "Enter your password",
  showVisibilityToggle = true,
  error,
}) {
  const [password, setPassword] = useState(value || "");
  const [showPassword, setShowPassword] = useState(false);
  const { score, level } = calculateStrength(password);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(level);
    }
  }, [level, onStrengthChange]);

  useEffect(() => {
    setPassword(value);
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setPassword(newValue);
    if (onChange) onChange(newValue);
  };
  
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
    // Focus back on input after toggling visibility
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {label}
          </label>
          {showScoreNumber && (
            <span className="text-xs text-muted-foreground">
              {Math.floor((score / 6) * 10)}/10
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:border-[#D97757] transition-all font-medium text-sm pr-12",
            error ? "border-red-400" : "border-gray-100"
          )}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showVisibilityToggle && (
            <button
              type="button"
              onClick={toggleVisibility}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          )}
          
          {password && (
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-all scale-100",
              level === "weak" ? "bg-red-500" : level === "medium" ? "bg-orange-500" : "bg-green-500"
            )}>
              {level === "weak" ? (
                <X size={12} className="text-white" />
              ) : (
                <Check size={12} className="text-white" />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Password strength bar */}
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-500",
              i < Math.min(Math.ceil(score / 1.5), 4) ? strengthColors[level] : "bg-gray-200"
            )}
          />
        ))}
      </div>
      
      {/* Strength label */}
      {showScore && level !== "empty" && (
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-wider transition-colors ml-1",
          level === "weak" ? "text-red-500" :
          level === "medium" ? "text-orange-500" :
          level === "strong" ? "text-green-500" :
          "text-emerald-500"
        )}>
          {strengthLabels[level]}
        </p>
      )}
    </div>
  );
}
