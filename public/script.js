const socket = io("/");
// access the place holder of the video from html
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443", // web port to exchange html file and video
});
// global variable to store the requested stream
let myVideoStream;
// create the video tag to display the user video on the sharing screen
const myVideo = document.createElement("video");
myVideo.muted = true;
// helps to request a promise to use the video and audio  on share screen
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    //accessing the requested stream
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // connect the emit from the server
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    // input value
    let count = 0;
    let userNumber = 1;
    let text = $("input");

    // when press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        count++;
        if (userNumber != 1) {
          userNumber == 2;
          userNumber--;
        } else if (userNumber != 2) {
          userNumber++;
        }
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      let color = "white";
      if (count % 2 === 0) {
        color = "blue";
      }
      $("ul").append(
        `<li class="message" style ='color:${color};'<b>user - ${userNumber}</b><br/> ${message}</li>`
      );
      scrollToBottom();
    });
  });
// disconnect the user if it existed
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});
// when the user connect the open event and generate user id
myPeer.on("open", (id) => {
  // notified to connect or to join and send the room_id, userId (peer id)
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  // create the user video tag element
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}
// connect the element  and the stream(the requested )
function addVideoStream(video, stream) {
  video.srcObject = stream; // source
  //  added  the video on the html
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
