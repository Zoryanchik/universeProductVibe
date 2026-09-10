import React from "react";

interface UserResponseProps {
  content: string;
}

export const UserResponse: React.FC<UserResponseProps> = ({ content }) => (
  <div className="flex justify-end">
    <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-[15px] leading-[21px] text-black/87">
      {content}
    </div>
  </div>
);
