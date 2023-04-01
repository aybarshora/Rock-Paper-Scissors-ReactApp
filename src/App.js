import "./App.css";
import { useEffect, useState } from "react";
import ActionButton from "./components/ActionButton";
import Player from "./components/Player";
import ShowWinner from "./components/ShowWinner";
import { ethers } from "ethers";
import Button from 'react-bootstrap/Button';
import ContractAbi from './ContractAbi.json'
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { wait } from "@testing-library/user-event/dist/utils";

const actions = {
  rock: ["scissors"],
  paper: ["rock"],
  scissors: ["paper"],
};


function calculateWinner(action1, action2) {
  if (action1 === action2) {
    return 0;
  } else if (actions[action1].includes(action2)) {
    return -1;
  } else if (actions[action2].includes(action1)) {
    return 1;
  }

  // This should never really happen
  return null;
}
//

const App = () => {

  const contractAddress = "0xdc93b5cbdc75f048237a728d65bad9f6c5b1b30c"
  const [playerAction, setPlayerAction] = useState("")
  const [computerAction, setComputerAction] = useState("")
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [winner, setWinner] = useState(0)
  const [betAmount, setBetAmount] = useState(0)
 
  
  const onActionSelected = (selectedAction) => {
    setPlayerAction(selectedAction);
    setComputerAction("")
  };

  const provider = new ethers.providers.Web3Provider(window.ethereum)
    
  const [connButtonText, setConnButtonText] = useState("Connect to Wallet")
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [contract, setContract] = useState(null)
  const [contractChoice, setContractChoice] = useState(null)
  const [txHash, setTxHash] = useState(0)

 
  const connectWalletHandler = () => {
    if (window.ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
            await accountChangedHandler(provider.getSigner());
        })
    } else {
        setErrorMessage("Please Install Metamask!!!");
    }
  }
  
  const accountChangedHandler = async (newAccount) => {
    const address = await newAccount.getAddress()
    setConnButtonText(address)
    setAccount(address)
    const balance = await newAccount.getBalance()
    setBalance(ethers.utils.formatEther(balance))
    await getuserBalance(address)
    connectContract()
  }

  const getuserBalance = async (address) => {
    const balance = await provider.getBalance(address, "latest")
  }

  const connectContract = () =>{
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
   
    let tempSigner = tempProvider.getSigner();
   
    let tempContract = new ethers.Contract(contractAddress, ContractAbi, tempSigner);
    setContract(tempContract);
  }

  const play = () =>{
    let choice = 2;
    if(playerAction === "rock"){
      choice = 0;
    }else if(playerAction === "paper"){
      choice = 1;
    }

    if(betAmount < 0.0001 && playerAction === ""){
      alert("Bet Amount is too small or player action havent been chosen")
    }else{
      contract.play(choice, betAmount*(10**18));   
      
      setTimeout(() => {
        fetchContractChoice();

      }, 30000);
    
    }
  }

  const displayCompChoice = () =>{
    let compChoice = "rock"
    if(contractChoice === 1){
      compChoice = "paper"
    }else if(contractChoice === 2){
      compChoice = "scissors";
    }
    
     setComputerAction(compChoice);
  
     const newWinner = calculateWinner(playerAction, compChoice);
     setWinner(newWinner);
     if (newWinner === -1) {
       setPlayerScore(playerScore + 1);
     } else if (newWinner === 1) {
       setComputerScore(computerScore + 1);
     }
  }

  let fromBlock = 28551927;

  const fetchContractChoice = () => {
    fetch("https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock="+{fromBlock}+"&address=0xdc93b5cbdc75f048237a728d65bad9f6c5b1b30c&topic0=0x97fd6c5e9f48eeb73ef287fb5bef779f2e9006665f25f552103c590aba7243b0&apikey=QKCI5ZUE1ME49B59W92NC5PAAFDRX9QEYJ")
      .then(response => {
        return response.json()
      })
      .then(events => {
        const last = events.result.length;
        
        const stringDataOfLog = (String(events.result[last-1].data).slice(129, 130))
        console.log(stringDataOfLog);
        setTxHash(events.result[last-1].transactionHash);
        setContractChoice(Number(stringDataOfLog))
        fromBlock++;
      })
  }

  useEffect(() =>{
    if(contractChoice !== null){
      displayCompChoice();
      console.log("Comp Choice : "+contractChoice)
    }else console.log("Comp Choice : "+contractChoice);
  }, [contractChoice])
    
  const handleChangeOnBet = (event) => {
    setBetAmount(event.target.value);
  };

  return (
    <div className="center">
      <h1>Rock Paper Scissors</h1>
        <Button className="button-connect" variant="outline-primary" onClick={connectWalletHandler}>{connButtonText}</Button>{' '}
      <div>
        <div className="container">
          <Player name="Player" score={playerScore} action={playerAction} />
          <Player
            name="Computer"
            score={computerScore}
            action= {computerAction}
          />
        </div>
        <div>
          <ActionButton action="rock" onActionSelected={onActionSelected} />
          <ActionButton action="paper" onActionSelected={onActionSelected} />
          <ActionButton action="scissors" onActionSelected={onActionSelected} />
        </div>
        <div className="inputs">  
          <InputGroup className="mb-3">
        <InputGroup.Text id="inputGroup-sizing-default">
          Bet Amount 
        </InputGroup.Text>
        <Form.Control
          aria-label="Bet Amount"
          aria-describedby="inputGroup-sizing-default"
          onChange={handleChangeOnBet}
          value={betAmount}
        />
      </InputGroup>
      </div>
        <Button variant="success" className="button-play" onClick={play} >Play!</Button>{' '}
        <ShowWinner className="show-winner"winner={winner}/>
        <p>Latest transaction hash:{txHash}</p> 
      </div>
    </div>
  );
}

export default App;

// https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=28510483&address=0x5881cf4a47c00fec900ac8aec7b87b5f803966c4&topic0=0x97fd6c5e9f48eeb73ef287fb5bef779f2e9006665f25f552103c590aba7243b0&apikey=QKCI5ZUE1ME49B59W92NC5PAAFDRX9QEYJ

