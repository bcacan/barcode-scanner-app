//@ts-nocheck
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import moment from "moment";

const callAPI = async (code: string) => {
  try {
    const res = await fetch(`api/woocOrder?code=${code}`);
    const data = await res.json();
    console.log("json:", data);
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};
var html5QrCode;
export default function Scanner() {
  // const [scannedCode, setScannedCode] = useState(true);
  const scannerRef = useRef(null);

  const [foundCode, setFoundCode] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    html5QrCode = new Html5Qrcode(/* element id */ "reader");
  }, []);

  useEffect(() => {
    if (!foundCode) return;

    html5QrCode.pause(true);
    // scannerRef.current.style.display = "none";
  }, [foundCode]);

  ///

  const initScan = () => {
    // This method will trigger user permissions
    // Html5Qrcode.getCameras()
    //   .then((devices) => {
    //     /**
    //      * devices would be an array of objects of type:
    //      * { id: "id", label: "label" }
    //      */
    //     if (devices && devices.length) {
    //       var cameraId = devices[0].id;
    //       // .. use this to start scanning.
    //       startScan(cameraId);
    //     }
    //   })
    //   .catch((err) => {
    //     // handle err
    //   });

    startScan({ facingMode: "environment" });
  };

  const startScan = (cameraId) => {
    // const html5QrCode = new Html5Qrcode(/* element id */ "reader");
    html5QrCode
      .start(
        cameraId,
        {
          fps: 10, // Optional, frame per seconds for qr code scanning
          qrbox: { width: 250, height: 250 }, // Optional, if you want bounded box UI
        },
        (decodedText, decodedResult) => {
          // do something when code is read
          sendScannedResult(decodedText, decodedResult);
          setFoundCode(true);
        },
        (errorMessage) => {
          // parse error, ignore it.
          console.warn(`Code scan error = ${errorMessage}`);
        },
      )
      .catch((err) => {
        // Start failed, handle it.
        console.warn(`Start failed = ${err}`);
      });
  };

  const stopScan = () => {
    html5QrCode
      .stop()
      .then((ignore) => {
        // QR Code scanning is stopped.
      })
      .catch((err) => {
        // Stop failed, handle it.
      });

    clearStates();
  };
  const resumeScan = () => {
    html5QrCode.resume();
    clearStates();
  };

  const sendScannedResult = (decodedText: any, decodedResult: any) => {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);

    callAPI(decodedText)
      .then((res) => {
        if (res) setOrderResult(res);
      })
      .catch((e) => console.log("Error catch: ", e));
  };

  const clearStates = () => {
    setFoundCode(false);
    setOrderResult(null);
  };

  return (
    <div>
      <Header
        initScan={initScan}
        stopScan={stopScan}
        resumeScan={resumeScan}
        foundCode={foundCode}
      />

      <div id="reader" ref={scannerRef} /*width="600px"*/></div>

      {/* {scannedCode && <button onClick={() => }> CHECK </button>} */}

      {foundCode && !orderResult && (
        <i>
          <h2>loading...</h2>
        </i>
      )}
      {orderResult && <Info data={orderResult} />}
    </div>
  );
}

function Header(props) {
  return (
    <div className="head-buttons">
      <button className="button b-secondary" onClick={props.stopScan}>
        Stop
      </button>

      {props.foundCode ? (
        <button className="button b-primary" onClick={props.resumeScan}>
          <img src="scan-icon.svg"></img>
          Skeniraj ponovo
        </button>
      ) : (
        <button className="button b-primary" onClick={props.initScan}>
          <img src="scan-icon.svg"></img>
          Skeniraj
        </button>
      )}
    </div>
  );
}

function Info({ data }) {
  data = data["result"];
  const printData = data ? JSON.stringify(data, null, 2) : "";

  const member_product = data["products_skus"]
    ? data["products_skus"].includes("KGCLAN")
    : null;

  console.log("clanstvo:", member_product, data["products_skus"]);
  const date = data["date_created"] ? moment(data["date_created"]["date"]) : false;

  const date_fromnow = date && date.isValid() ? date.fromNow(true) : false;
  const diff_years = date && date.isValid() ? moment().diff(date, "years", true) : false; // razlika u godinama

  const order_valid = diff_years && diff_years <= 1 && data["status"] == "completed";
  const valid_until = diff_years
    ? date.add(1, "years").format("DD. MM. YYYY. - HH:mm:ss")
    : false;

  return (
    <>
      <div className="info-container">
        {/* <hr /> */}
        {member_product ? (
          order_valid ? (
            <div>
              <h1 className="member">
                <b>ČLAN</b>
              </h1>
              <div>
                <b>Ime: </b>
                {data["name"]}
              </div>
              <div>
                <b>Vrijedi do: </b>
                {valid_until}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="non-member">
                <b>NIJE ČLAN</b>
              </h1>
              <div>Kupljeno prije: {date_fromnow}</div>
              <div>Status narudžbe: {data["status"]}</div>

              <details>
                <summary>Info:</summary>
                <pre>{printData}</pre>
              </details>
            </div>
          )
        ) : (
          <div>
            <h4 className="non-member">NIJE ČLANSTVO</h4>
            <details>
              <summary>Info:</summary>
              <pre>{printData}</pre>
            </details>
          </div>
        )}
      </div>
    </>
  );
}
