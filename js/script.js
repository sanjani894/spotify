console.log("lets write javascript")

let currsong= new Audio();  //Plays songs
let songs; //global variable
let currfolder;

                                                     
function secondstominutes(seconds){
  if(isNaN(seconds) || seconds<0){
    return "00:00";
  }
  const minutes=Math.floor(seconds/60);
  const remainingseconds= Math.floor(seconds%60);
  const formatminutes=String(minutes).padStart(2,'0');
  const formatseconds=String(remainingseconds).padStart(2,'0');
  return `${formatminutes}:${formatseconds}`;
}



async function getsongs(folder){
  currfolder=folder;
   let a = await fetch(`http://127.0.0.1:5500/frontened/spotify/${folder}/`);    //fetch---Loads files from local server
   let response = await a.text();
  //  console.log(response);
   let div = document.createElement("div");
   div.innerHTML=response;
   let as=div.getElementsByTagName("a");
   songs=[];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if(element.href.endsWith(".mp3")){
      songs.push(element.href.split(`${folder}/`)[1]);  ///////////////
    }
   
  } return songs;
       
}
    


  



const playMusic =(track , pause=false)=>{
  // let audio= new Audio("/frontened/spotify/songs/" + track)
  currsong.src = `/frontened/spotify/${currfolder}/` + track;
  // audio.play();
  if(!pause){
     currsong.play();  /*--s--*/
     play.classList.add("fa-circle-pause");/*----*/
  }else {
  // Ensure play button shows play icon when song is loaded but paused
  play.classList.remove("fa-circle-pause");
  play.classList.add("fa-circle-play");
}
  document.querySelector(".songinfo").innerHTML=track;
  document.querySelector(".songtime").innerHTML="00:00/00:00";
  
}

async function displayalbums(){
  let a = await fetch(`http://127.0.0.1:5500/frontened/spotify/songs/`);
   let response = await a.text();
  //  console.log(response);
   let div = document.createElement("div");
   div.innerHTML=response;
   console.log(div) 
   let anchors =div.getElementsByTagName("a");
   let cardcontainer=document.querySelector(".cardContainer");
   for(const e of anchors){
     if(e.href.includes("/songs/")){
       let folder=e.href.split("/").slice(-1)[0];
      //  get the metadata of the folder
       let a= await fetch(`http://127.0.0.1:5500/frontened/spotify/songs/${folder}/info.json`)
       let response= await a.json();
       console.log(response);
       cardcontainer.innerHTML=cardcontainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <img src="img/play.svg" alt="">
                        </div>
                        <img src="/frontened/spotify/songs/${folder}/cover.jpg"  alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                        
       </div>`
     }
   }
   //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
      // console(item, item.currrentTarget.dataset);
      e.addEventListener("click",async (item)=>{
        songs=await getsongs(`songs/${item.currentTarget.dataset.folder}`);
       
         //show all the songs in the playlist
    let songul=document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songul.innerHTML="";  //so songs donot append
   for (const song of songs) {
      songul.innerHTML=songul.innerHTML + `
      <li>
                        <i class="fa-solid fa-music special" ></i>
                        <div class="info">
                            <div>${decodeURIComponent(song)} </div>
                            <div>Harry</div>
                        </div>
                        <div class="playnow">
                            <span>playnow</span>
                             <i  class="fa-solid fa-circle-play" ></i>
                        </div>             
      </li>`;  //////////////
   }
   playMusic(songs[0])
    // //play first songs
    // var audio = new Audio(songs[0]);
    // // audio.play();

    // audio.addEventListener("loadeddata",()=>{
    //   console.log(audio.duration,audio.currentSrc,audio.currentTime);
    // });
    
      //attach an eventlistener to each song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
      e.addEventListener("click",elements=>{
           console.log(e.querySelector(".info").firstElementChild.innerHTML); /*songs display */
           let songName = e.querySelector(".info").firstElementChild.textContent.trim();
           playMusic(encodeURIComponent(songName));


      })
        /*------for each------ */
    })
     
      })
    })
}




async function main(){
  let play = document.getElementById("play");
  //get the list of all song
     songs=await getsongs("songs/folder1"); 
    playMusic(songs[0],true); /*--s--*/
    // console.log(songs);
    
   //display all the albums in the page
   displayalbums()


    //attach an event listener to play,next and previous
   
    play.addEventListener("click",()=>{
       if(currsong.paused){
        currsong.play();
        // play.src="pause.svg"
        play.classList.remove("fa-circle-play");
        play.classList.add("fa-circle-pause");
       }else{
        currsong.pause();
        // play.src="plays.svg"
        play.classList.remove("fa-circle-pause");
        play.classList.add("fa-circle-play");
       }
    })

    //listen for time update event
    currsong.addEventListener("timeupdate",()=>{
      // console.log(currsong.currentTime, currsong.duration); //giving in seconds
      document.querySelector(".songtime").innerHTML=`${secondstominutes(currsong.currentTime)}/${secondstominutes(currsong.duration)}`
      document.querySelector(".circle").style.left=(currsong.currentTime / currsong.duration)*100 +"%";

    })
    ///add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
      let percent=(e.offsetX / e.target.getBoundingClientRect().width)*100 
      document.querySelector(".circle").style.left=percent + "%";
      currsong.currentTime=((currsong.duration)*percent)/100 ;
    })
    //add an event listener to hammer
    document.querySelector("#hammer").addEventListener("click",()=>{
      document.querySelector(".left").style.left= "0%" ;
    }) 
    //add  evnetlistener to close
    document.querySelector("#cross").addEventListener("click",()=>{
      document.querySelector(".left").style.left= "-120%" ;
    })
    //add an eventistener to previous
    previous=document.querySelector("#previous") ;
    previous.addEventListener("click",()=>{
      // console.log(currsong);
      // console.log(songs);
      currsong.pause();
      let index= songs.indexOf(currsong.src.split("/").slice(-1)[0]); 
      /*after *writing [0] its doesnot shoe array*/
      if(index-1 >=0)
      playMusic(songs[index-1])
      else{
        playMusic(songs[index]);
      }
    })
    //add an eventistener to next
    next=document.querySelector("#next") ;
     next.addEventListener("click",()=>{
      currsong.pause();
     let index= songs.indexOf(currsong.src.split("/").slice(-1)[0]); 
     if((index+1) < songs.length){
        playMusic(songs[index+1]);
     }else{
       playMusic(songs[index]);
     }
    })
    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
      // console.log(e,e.target,e.target.value); /* out of 100 but in volume 0-1 */
      currsong.volume=parseInt(e.target.value)/100; /*parseint string to int remove decimal part */
      if(currsong.volume > 0){    //if muted then touch range(volume) icon should change
        document.querySelector(".volume>i").classList.remove( "fa-volume-xmark");
          document.querySelector(".volume>i").classList.add("fa-volume-high");
      }
    })
    //add eventlistener to mute the volume
    document.querySelector(".volume>i").addEventListener("click",(e)=>{
         console.log(e.target);
         if(e.target.classList.contains("fa-volume-high")){
          e.target.classList.remove( "fa-volume-high");
          e.target.classList.add( "fa-volume-xmark");
          currsong.volume=0;
          document.querySelector(".range").getElementsByTagName("input")[0].value=0;
         }else{
          e.target.classList.remove( "fa-volume-xmark");
          e.target.classList.add("fa-volume-high");
          currsong.volume=0.1;
          document.querySelector(".range").getElementsByTagName("input")[0].value=10;
         }
        
    })

}
main();