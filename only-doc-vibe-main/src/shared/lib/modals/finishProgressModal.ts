import type { EModalsTypes } from "../../constants/modals-keys";
import { wait } from "../utils/wait";
import { closeModal, updateCurrentModalOptions } from "./modals-store";

interface IFinishProgressModalOptions {
  closeDelay?: number;
  closeOnFinish?: boolean;
}

export const finishProgressModal = async (
  modalType: EModalsTypes,
  options: IFinishProgressModalOptions = {}
) => {
  const { closeDelay: animationDelay = 500, closeOnFinish = true } = options;

  updateCurrentModalOptions(modalType, {
    downloadProgress: 100,
  });

  await wait(animationDelay);

  if (closeOnFinish) {
    closeModal(modalType);
  }
};
