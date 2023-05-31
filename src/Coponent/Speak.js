import { React, useState, useRef, useEffect } from "react";
import "./speak.css";

export default function Speak() {
  //  styling
  const selectStyles = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "2px",
    backgroundColor: "white ",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    width: "80%",
  };

  const buttonStyles = {
    color: "#332FD0",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    border: "1px solid black",
    borderRadius: "100%",
    backgroundColor: "#FF4949",
    transition: "all 0.4s ease",
    background: "linear-gradient(to right top, #392c2c, #6d2e2f, #9f2a2b, #do1d20, #ff0000)",
    backgroundPosition: "right bottom"
  };

  const handleHover = (event) => {
    event.target.style.color = "#FF4949";
    event.target.style.border = "none";
    event.target.style.borderRadius = "100%";
    event.target.style.backgroundColor = "white";
    event.target.style.backgroundPosition = "left bottom";
    event.target.style.background = "linear-gradient(to right top, white)";
  };

  const handleLeave = (event) => {
    event.target.style.color = "white";
    event.target.style.border = "1px solid black";
    event.target.style.borderRadius = "100%";
    event.target.style.backgroundColor = "#FF4949";
    event.target.style.background = "linear-gradient(to right top, #392c2c, #6d2e2f, #9f2a2b, #do1d20, #ff0000)";
  };

  // javascript
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const [value, setValue] = useState("");
  const [buttonText, setbuttonText] = useState("play");
  const [isPlaying, setisPlaying] = useState(true);
  const [flag, setflag] = useState(false);

  const [volume, setvolume] = useState(50);
  const [pitch, setpitch] = useState(100);
  const [rate, setrate] = useState(1.06);

  const [count, setcount] = useState(0);

  const utteranceRef = useRef(null);
  const synth = window.speechSynthesis;


  let text = value;

  // grab the UI elements to work with
  const textEl = document.getElementById("text");

  useEffect(() => {
    // Fetch the available voices when the component mounts
    const fetchVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = fetchVoices;
    }

    fetchVoices();

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const handleVoiceChange = (event) => {
    const selectedVoiceIndex = event.target.value;
    const selectedVoice = voices[selectedVoiceIndex];
    setSelectedVoice(selectedVoice);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const utterThis = new SpeechSynthesisUtterance(value);

    utteranceRef.current = utterThis;

    utterThis.volume = volume / 100;
    utterThis.pitch = pitch / 100;
    utterThis.rate = rate;

    utterThis.voice = selectedVoice;
    utterThis.addEventListener("boundary", handleBoundary);

    synth.speak(utterThis);

    utterThis.addEventListener("end", () => {
      synth.cancel();
      setbuttonText("play");
    });
  };

  const renderVoiceOptions = () => {
    return voices.map((voice, index) => (
      <option key={index} value={index}>
        {voice.name}
      </option>
    ));
  };

  function handleBoundary(event) {
    if (event.name === "sentence") {
      // we only care about word boundaries
      return;
    }
    const numberOfWordsArray = text.split(/\s+/);
    const numberOfWords = numberOfWordsArray.length;

    const wordStart = event.charIndex;
    


    let wordLength = event.charLength;
    if (wordLength === undefined) {
      const match = text.substring(wordStart).match(/^[a-z\d']*/i);
      wordLength = match[0].length;
    }

    // wrap word in <mark> tag
    const wordEnd = wordStart + wordLength;
    const word = text.substring(wordStart, wordEnd);
    const markedText =
      text.substring(0, wordStart) +
      "<mark>" +
      word +
      "</mark>" +
    text.substring(wordEnd);
    textEl.innerHTML = markedText;
  
  }

  // toggle play and pause
  const toggle = () => {
    if (isPlaying) {
      setisPlaying(false);
      synth.pause();
      setbuttonText("play");
    } else {
      setisPlaying(true);
      synth.resume();
      setbuttonText("pause");
    }
  };

  // side bar
  const sideButtonopen = () => {
    if (synth.speaking) {
      console.log("volume is " + volume);
      setisPlaying(false);
      synth.pause();
      setbuttonText("play");
      setflag(true);
      utteranceRef.current.volume = volume / 100;
      utteranceRef.current.pitch = pitch / 100;
      utteranceRef.current.rate = rate;
    }
  };

  const sideButtonclose = () => {
    if (!isPlaying && flag) {
      console.log("volume is " + volume);
      setisPlaying(true);
      synth.resume();
      setbuttonText("pause");
      setflag(false);
      utteranceRef.current.volume = volume / 100;
      utteranceRef.current.pitch = pitch / 100;
      utteranceRef.current.rate = rate;
    }
  };

  // functions
  const clear = () => {
    setValue("");
    textEl.innerHTML = "";
    synth.cancel();
  };

  const paste = () => {
    navigator.clipboard
      .readText()
      .then((pasteText) => {
        setValue(pasteText);
        console.log("Pasted text:", pasteText);
      })
      .catch((error) => {
        console.error("Failed to paste:", error);
      });
  };

  const repeat = () => {
    if (synth.speaking) synth.cancel();
    setisPlaying(true);
    setbuttonText("pause");
  };

  return (
    <div id="gradient">
      {/* navbar */}
      <nav
        className="navbar navbar-light bg-light fixed-top mb-5 pt-3 pb-2"
        style={{
          background: "linear-gradient(45deg, #4158d0, #c850c0, #ffcc70)",
        }}
      >
        <div className="container-fluid">
          <a
            className="navbar-brand text-light"
            href="#"
            style={{
              fontFamily: "Sigmar",
              letterSpacing: "2px",
              fontSize: "22px",
            }}
          >
            SPEAKIFY
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasDarkNavbar"
            aria-controls="offcanvasDarkNavbar"
            aria-label="Toggle navigation"
          >
            <span
              onClick={sideButtonopen}
              className="navbar-toggler-icon"
            ></span>
          </button>
          <div
            className="offcanvas offcanvas-end text-bg-dark"
            tabIndex="-1"
            id="offcanvasDarkNavbar"
            aria-labelledby="offcanvasDarkNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
                SETTING
              </h5>
              <button
                onClick={sideButtonclose}
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div
              className="offcanvas-body"
              style={{
                background: "linear-gradient(45deg, #4158d0, #c850c0, #ffcc70)",
              }}
            >
              <label htmlFor="customRange1" className="form-label mx-3 mt-5">
                VOLUME
              </label>
              <input
                value={volume}
                type="range"
                min="0"
                max="100"
                className="voice form-range mb-4"
                id="customRange1"
                onChange={(e) => setvolume(e.target.value)}
              ></input>

              <label for="customRange1" className="form-label mx-3">
                PITCH
              </label>
              <input
                value={pitch}
                type="range"
                min="0"
                max="200"
                className="voice form-range mb-4"
                onChange={(e) => setpitch(e.target.value)}
              ></input>

              <label htmlFor="customRange1" className="form-label mx-3">
                SPEED
              </label>
              <input
                value={rate}
                type="range"
                min="0.1"
                max="2"
                step={0.02}
                className="voice form-range mb-4 "
                id="customRange1"
                onChange={(e) => setrate(e.target.value)}
              ></input>
              <div className="select mt-5 container"> 
              <select 
                className="select selectScroll"
                value={selectedVoice ? voices.indexOf(selectedVoice) : ""}
                onChange={handleVoiceChange}
               >
                <span class="focus"></span>
                <option value="Select a voice">
                  Select Voice
                </option>
                {renderVoiceOptions()}
              </select>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <br />

      <br />

      {/* text div */}
      <div
        className="container wrapper mt-5 scrollable-container mx-4"
        style={{
          width: "95%",
          height: "18rem",
          maxWidth: "calc(100vw - 40px)",
          padding: "30px",
          paddingBottom: "50px",
          backgroundColor: "#6B728E",
          overflowY: "scroll",
          borderTop: "10px solid #6B728E",
          borderBottom: "10px solid #6B728E",
          borderLeft: "1px solid #6B728E",
          borderRight: "1px solid #6B728E",
        }}
      >
        <div id="text" className=" fs-6 fw-medium text-start "></div>
      </div>

      {/* input text form */}
      <form
        onSubmit={handleSubmit && handleSubmit}
        className="container mt-2 fs-6"
      >
        <textarea
          className="textscrollbar container mt-2 border border-4 mx-start fs-6 text-body-secondary fw-semibold"
          rows="5"
          placeholder="Enter text here to convert to speech"
          id="floatingTextarea"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <br />


        <div>
          <div>
            <button className="btn btn-outline-dark mx-1" onClick={clear}>
              <i className="fa-solid fa-broom"></i>{" "}
            </button>

            <button className="btn btn-outline-dark mx-1" onClick={repeat}>
              {" "}
              <i className="fa-solid fa-repeat"></i>{" "}
            </button>
            <button className="btn btn-outline-dark mx-1" onClick={paste}>
              {" "}
              <i className="fa-solid fa-paste"></i>{" "}
            </button>
            <button
              className="btn btn-link my-1 p-0 "
              style={{ width: "70px", height: "70px" }}
            >
              <i
                onClick={toggle}
                style={buttonStyles}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                id="submitButton"
                className={` fa-sharp fa-4x fa-solid fa-circle-${buttonText} play mx-2 p-0`}
              ></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
