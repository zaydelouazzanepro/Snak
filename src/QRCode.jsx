import qrcode from "qrcode-generator";

function QRCode({ value }) {
  const qr = qrcode(0, "H");

  qr.addData(String(value));
  qr.make();

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: qr.createSvgTag(9, 5),
      }}
    />
  );
}

export default QRCode;