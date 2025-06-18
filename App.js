import back from './images/back.png';
import axios from 'axios';
import React, {useState,useCallback} from 'react';
import './App.css';
import { RotatingLines } from "react-loader-spinner";




// to launch
// cd old-maid
// npm start


var currCode = '';
var rem = 51;
var deck_id ='';
let rem1 = '';
let rem2 = '';
let win = "";


    
    
function App() {

    const [p1Images, setP1Images] = useState([]);
    const [p2Images, setP2Images] = useState([]);
    const [p2Pairs, setP2Pairs] = useState([]);
    const [p1Pairs, setP1Pairs] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    const newGame = async () => {
      
      await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AS,AD,AC,AH,2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,0S,0D,0C,0H,JS,JD,JC,JH,QS,QD,QC,KS,KD,KC,KH")
      .then(response => { 
        console.log(response.data);

        deck_id = response.data.deck_id;
        
        
      }).catch(error=>{return error;});
      
    }

    

    const gamePlay = async () =>{
      // check length of each pile
      // which ever one is 0 is not the old maid

      // if none are 0, call check Pairs
      // draw card at random from opp's pile
      // check Pairs
      // repeat until one pile is 0
      
      
      setDataLoading(true);
      await newGame();
      await setPiles();
      setDataLoading(false);

      await printOnScreen("player1");
      await printOnScreen("player1Pairs");
      await printOnScreen("player2");
      await printOnScreen("player2Pairs"); 
    }

   
    

    const setPiles = async () => {

      while (rem > 0){

       var curr = await drawCard();
       await addToPile("player1", curr);

       if (rem <=0){
        break;
       }

       curr = await drawCard();
       await addToPile("player2", curr);
       
      }
      await showPairs("player1");
      await showPairs ("player2");

      await checkPairs("player1", "player1Pairs");
      await checkPairs("player2", "player2Pairs");

      await showPairs("player1Pairs");
      await showPairs ("player2Pairs");

      await setDataLoading(false);

      
    }
    
   
    const addToPile = async(pile, card) => {

      await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/add/?cards=${card}`)
      .catch(error=>{return error;});

    }

    const checkPairs = async (pile, pairPile) => {
        var arr = {};
        const freqMap = {};
        await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/list/`)
        .then(response => { 
          
           arr = response.data.piles[pile].cards;
         
            arr.forEach(item => {
              var res = item.value;
             
              freqMap[res] = (freqMap[res] || 0) + 1;
            }
            
        ); }).catch(error=>{return error;});

      console.log(freqMap);

      for (let key in freqMap) {
        let even = (freqMap[key] % 2) === 0;
        if (even === true) {
 
            for(const item of arr){
              if (item.value === key){

                await drawFromPile(pile, item.code, pairPile);
              }
              
            }
           
        }else if (freqMap[key]>1){
          let count = 2;
          for (const item of arr){
            if (count > 0){
              if (item.value === key){
                await drawFromPile(pile, item.code, pairPile);
                count -= 1;
              }

            }else{
              break;
            }
          }
        }
      }

    }

    const drawFromPile = async (pile,card,pairPile) =>{
        await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/draw/?cards=${card}`)
        .catch(error=>{return error;});
        console.log("added "+card+" to "+pairPile);
        await addToPile(pairPile, card);
    }

    const drawRand = async (pile,targetPile) =>{
      let cd =  '';
      await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/draw/random`)
      .then(responses=>{
        cd = responses.data.cards[0].code;
        console.log("drawn from "+pile+" :" +cd+ " added to "+ targetPile);
      }).catch(error=>{return error;});
      await addToPile(targetPile, cd);
    }

    const showPairs = async (pile) =>{
      return axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/list/`)
      .then(response => { 
        console.log(response.data);
      }).catch(error=>{return error;});
      
    }

    const drawCard = async() => {
      return axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`)
      .then(response => { 
        console.log(response.data);
        currCode = response.data.cards[0].code;
        rem-=1;
        return currCode;
      }).catch(error=>{return error;});
    }

    const printOnScreen = async(pile) => {
     
     
      await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/list/`)
      .then(response => { 
        const arr = response.data.piles[pile].cards || [];
        
        const images = arr.map((card) => card.image); // extract image URLs
        console.log(`Pile: ${pile}`, arr); 

        if (pile === "player1"){
          setP1Images([...images]);
        }else if(pile === "player2"){
          setP2Images([...images]);
        }else if(pile === "player1Pairs"){
          setP1Pairs([...images]);
        }else if(pile === "player2Pairs"){
          setP2Pairs([...images]);
        }
      }).catch(error=>{return error;});
      
    }
    const delay = async (ms) => {
      return new Promise((resolve) => 
          setTimeout(resolve, ms));
    };

    const update = async() =>{
      await printOnScreen("player1"); 
      await getRem("player1");
      await printOnScreen("player1Pairs");
      await printOnScreen("player2");
      await getRem("player2");
      await printOnScreen("player2Pairs");
    }

    const drawFrom = async () => {
      //check if player1 or 2 has 0
      
      await getRem("player1");
      await getRem("player2");
      
       
        if (rem1 === 0 || rem2 === 0){
          update();
          
          if (rem1 === 0){
            win = "Player 1";
          }else{
            win = "Player 2";
          }
          console.log("The winner is "+ win);
        }else{
          await drawRand("player2", "player1"); //pull from player 2 add to player 1 
          await update();
          
        }
 
      return (
       
        <div>
          <h2> The winner is {win}</h2>
        </div>
      );

      

    }

    const pairs = async () =>{
          await checkPairs("player1","player1Pairs"); //check pairs in player 1 (add to player1Pairs if yes)
          await update();
          if (rem1 === 0 || rem2 === 0){
            update();
            
            if (rem1 === 0){
              win = "Player 1";
            }else{
              win = "Player 2";
            }
            console.log("The winner is "+ win);
          }else{
            await drawRand("player1", "player2");
            await update();
            await checkPairs("player2","player2Pairs");
            await update();
          }
    }

    const getRem = async (pile) =>{
      await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile}/list/`)
      .then(response => { 
       if (pile === "player1"){
        rem1 = response.data.piles[pile].remaining;
       }else {
        rem2 = response.data.piles[pile].remaining;
       }
      }).catch(error=>{return error;});
    }

    
   
  return (
    

    <div>
      <div className="head">
        
        
       

       <ul>
          
           <li className="strt"> 
           {dataLoading ? (<RotatingLines height={40} width={40} color="#3498db" />) : (<button onClick={gamePlay}> Start</button>)}</li>
           <li><button onClick={drawFrom}> Draw</button></li> 
           <li><button onClick={pairs}> Check Pairs </button></li>
           
           <li className="maid"> Old Maid </li>
           <li> <button onClick={() => window.location.reload(false)}>Reload</button></li>
          
           
           <li><span className="instruction" data-text = "Any player shuffles the pack and deals them around, one at a time to each player,until all the cards have been handed out.&#xa;Players do not need to have an equal number of cards.&#xa;Each player removes all pairs from his hand face down.&#xa;If a player has three-of-a-kind, they remove only two of those three cards.&#xa; The dealer then offers their hand, spread out face down, to the player on the left, who draws one card from it.&#xa;This player discards any pair that may have been formed by the drawn card.&#xa;The player then offers their own hand to the player on their left.&#xa;Play proceeds in this way until all cards have been paired except one&#xa;- the odd queen, which cannot be paired - and the player who has that card is the Old Maid!">
              <div className="button">
                How To Play
              </div>
            </span></li>

           <li><h2 className="bgin">Press START to begin game</h2></li>
           <li><h4 className="bgin"> You are Player 1</h4></li>

           
       </ul>
      </div>
      
      
       
     
       
       
       <div className="flex-container" >

            
       
          </div>
          
          
          <h2>Player 1's Cards</h2>
          
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
              {p1Images.map((imageUrl, index) => (
                <img key={index} src={imageUrl} alt="Card" style={{ width: "100px", height: "auto", margin: "5px" }} />
              ))}
            </div>

            <h2>Player 1's Pairs</h2>
           
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
              {p1Pairs.map((imageUrl, index) => (
                <img key={index} src={back} alt="Card" style={{ width: "70px", height: "auto", margin: "5px" }} />
              ))}
            </div>

            <h2>Player 2's Cards</h2>
           
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", margin: "auto", justifyContent: "center"}}>
              {p2Images.map((imageUrl, index) => (
                <img key={index} src={back} alt="Card" style={{ width: "100px", height: "auto", margin: "5px"}} />
              ))}
            </div>

            <h2>Player 2's Pairs</h2>
           
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", margin: "auto", justifyContent: "center"}}>
              {p2Pairs.map((imageUrl, index) => (
                <img key={index} src={back} alt="Card" style={{ width: "70px", height: "auto", margin: "5px" }} />
              ))}
            </div>
           
            <p id="attr">buttons by Michael McMillan, image by starline on Freepik</p>
            
    </div>
    
  );
}
//stylistic designs to implement
/*
make the screen be split in 2 between player 1 and 2
other player should only show back of cards
cool effects of cards moving around
maybe pile at the bottom demonstratign where pairs have been put
*/

/*
1. sort deck 
2. find pairs
3. begin gameplay
    - check when player1 or player 2 deck is empty - if yes game ends
    - player 1 pulls from player 2 and add to deck
    - check if it is a pair
    - if yes then move to pair pile
    - repeat for player 2
 Any player shuffles the pack and deals them around, 
              one at a time to each player, until all the cards have been handed out. 
              Players do not need to have an equal number of cards.

              Each player removes all pairs from his hand face down. 
              If a player has three-of-a-kind, they remove only two of those three cards. 
              The dealer then offers their hand, spread out face down, to the player on the left,
              who draws one card from it. This player discards any pair that may have been formed 
              by the drawn card. The player then offers their own hand to the player on their left. 
              Play proceeds in this way until all cards have been paired except one - the odd queen, 
              which cannot be paired - and the player who has that card is the Old Maid!
          
*/


export default App;

