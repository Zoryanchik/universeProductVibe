import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactSignatureCanvas from "react-signature-canvas";

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  getCanvas: () => HTMLCanvasElement | undefined;
  toSvgDataURL: () => string | undefined;
}

interface SignatureCanvasProps {
  onBegin?: () => void;
  onEnd?: () => void;
}

export const SignatureCanvas = forwardRef<
  SignatureCanvasHandle,
  SignatureCanvasProps
>(({ onBegin, onEnd }, ref) => {
  const sigCanvasRef = useRef<ReactSignatureCanvas>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateSize = () => {
      setCanvasSize({
        width: wrapper.clientWidth,
        height: wrapper.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => sigCanvasRef.current?.clear(),
    isEmpty: () => sigCanvasRef.current?.isEmpty() ?? true,
    getCanvas: () => sigCanvasRef.current?.getCanvas(),
    toSvgDataURL: () =>
      sigCanvasRef.current?.getSignaturePad().toDataURL("image/svg+xml"),
  }));

  const handlePointerLeave = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      canvas.off();
      canvas.on();
    }
  };

  return (
    <div
      ref={wrapperRef}
      onPointerLeave={handlePointerLeave}
      className="box-border h-[225px] w-full cursor-cell overflow-hidden rounded-[12px] border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)]"
    >
      {canvasSize.width > 0 && canvasSize.height > 0 && (
        <ReactSignatureCanvas
          ref={sigCanvasRef}
          penColor="#000000"
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
          onBegin={onBegin}
          onEnd={onEnd}
        />
      )}
    </div>
  );
});
