import React, { useCallback, useState } from "react";
import checkIcon from "@public/assets/icons/check.svg?url";

import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { mockFn } from "@/shared/lib/utils/mock-fn";
import { Image } from "@/shared/ui/image";

interface RememberCheckboxProps {
  onChange: (value: boolean) => void;
  text: string;
}
export const RememberCheckbox: React.FC<RememberCheckboxProps> = ({
  onChange,
  text,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const onClick: React.MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      trackEvent(EAnalyticsEvents.REMEMBER_ME_TAP);
      setIsChecked((prev) => !prev);
      onChange(!isChecked);
    },
    [isChecked, onChange]
  );

  return (
    <div
      className="group relative flex cursor-pointer items-center ps-7.5"
      onClick={onClick}
      role="button"
    >
      <input
        className="peer absolute size-0 cursor-pointer opacity-0"
        id="remember_me"
        type="checkbox"
        checked={isChecked}
        onChange={mockFn}
      />
      <span className="rounded-1 group-hover:border-primary peer-checked:bg-primary absolute start-0.5 top-0 flex size-5 items-center justify-center border-2 border-black peer-checked:border-none peer-checked:[&_img]:block">
        <Image
          className="text-common-white hidden size-3 peer-checked:block"
          src={checkIcon}
          alt="check"
        />
      </span>
      <label
        className="text-text-primary text-body block cursor-pointer"
        htmlFor="remember_me"
      >
        {text}
      </label>
    </div>
  );
};
