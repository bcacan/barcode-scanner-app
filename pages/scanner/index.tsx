import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState } from "react";
import hello from "../api/hello";

const callAPI = async (code: string) => {
  try {
    const res = await fetch(`api/woocOrder?code=${code}`);
    const data = await res.json();
    console.log("json:", data);
  } catch (err) {
    console.log(err);
  }
};

export default function Scanner() {
  const [scannedCode, setScannedCode] = useState(true);
  const [wooData, setWooData] = useState();

  function onScanSuccess(decodedText: any, decodedResult: any) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
  }

  function onScanFailure(error: any) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  }

  useEffect(() => {
    let html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false,
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }, []);

  return (
    <div>
      <b>scanner</b>
      <div id="reader" width="600px"></div>

      {scannedCode && <button onClick={() => callAPI("1234")}> CHECK </button>}

      <pre>{wooData}</pre>
    </div>
  );
}
