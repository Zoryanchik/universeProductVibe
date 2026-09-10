import { type FC, type ChangeEventHandler, useRef } from "react";

const FOCUS_SHADOW =
  "focus-within:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]";

interface TextInputProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  icon?: string;
  onFocus?: () => void;
}

export const TextInput: FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  icon,
  onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`box-border flex w-[304px] items-center gap-2 rounded-[10px] border border-[rgba(0,0,0,0.14)] px-[10px] py-2 focus-within:border-[var(--color-primary-opacity-50)] ${FOCUS_SHADOW}`}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={onFocus}
        className="min-w-0 flex-1 border-none bg-transparent font-[Outfit,sans-serif] text-[16px] leading-6 font-light text-[rgba(0,0,0,0.87)] outline-none placeholder:text-[rgba(0,0,0,0.6)]"
      />
      {icon && (
        <span
          className="material-symbols-rounded shrink-0 cursor-pointer text-[20px] text-[rgba(0,0,0,0.6)] opacity-80 [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]"
          onClick={handleIconClick}
        >
          {icon}
        </span>
      )}
    </div>
  );
};
