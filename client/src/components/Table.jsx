import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Table = () => {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [leftTableNumbers, setLeftTableNumbers] = useState([]);
  const [rightTableNumbers, setRightTableNumbers] = useState([]);
  const [goalAchieved, setGoalAchieved] = useState(false);


  useEffect(() => {

    // Generate new random numbers every 400ms
    const interval = setInterval(() => {
        if(leftTableNumbers.length!==0)
        generateRandomNumbers();
    }, 400);
    return () => clearInterval(interval);
  }, [leftTableNumbers]);


  useEffect(()=>{
    if(rightTableNumbers.length===8){
      handleFinishGame()
      .then(res=>{
        console.log(res)
        if(res){
        alert(`Congratulations! You achieved the goal.
          Time taken: ${Date.now() - startTime} ms
          Sum of numbers: ${rightTableNumbers.reduce((a, b) => a + b, 0)}`)
          window.location.reload()
      }
      else{
        alert("You are unable to achieve your goal")
        window.location.reload()
      }
      })

    }
  },[rightTableNumbers])

  // useEffect(()=>{
  //     if(goalAchieved){
  //         alert(`Congratulations! You achieved the goal.
  //         Time taken: ${Date.now() - startTime} ms
  //         Sum of numbers: ${rightTableNumbers.reduce((a, b) => a + b, 0)}`)
  //     }else{
  //       if(rightTableNumbers.length===8){
  //           alert("You are unable to achieve your goal")
  //           window.location.reload()
  //       }
  //     }
  // },[rightTableNumbers])

  const startGame = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/start`, { username });
      const { sessionId, startTime, numbers } = res.data;
      setSessionId(sessionId);
      setStartTime(startTime);
      setLeftTableNumbers(numbers);
    } catch (error) {
      console.error('Error starting the game:', error);
    }
  };

  const handleClickLeftTable = (number) => {
    if (rightTableNumbers.length >= 8 || goalAchieved) return;
    setRightTableNumbers((prevNumbers) => [...prevNumbers, number]);
    setLeftTableNumbers((prevNumbers) =>
      prevNumbers.filter((n) => n !== number)
    );
  };

  const handleFinishGame = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/finish`, {
        sessionId,
        timeTaken: Date.now() - startTime,
        numbers: rightTableNumbers
      });
      const { goalAchieved } = res.data;
      setGoalAchieved(goalAchieved);
      return goalAchieved
    } catch (error) {
      console.error('Error finishing the game:', error);
    }
  };

  const generateRandomNumbers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/random-numbers/${rightTableNumbers.length>0?rightTableNumbers:999}`);
      const { numbers } = res.data;
      setLeftTableNumbers(numbers);
    } catch (error) {
      console.error('Error generating random numbers:', error);
    }
  };

  return (
    <div>
      <h1>Number Game</h1>
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={startGame}>Start</button>
      </div>
      <div style={{display:'flex',justifyContent:'center'}}>
      {leftTableNumbers && leftTableNumbers.length > 0 && (
        <div style={{paddingRight:'20px'}}>
          <h2>Left Table</h2>
          <table border="1" style={{borderCollapse:'collapse',cursor:'pointer'}}>
            {leftTableNumbers.map((number) => (
              <tr>
              <td key={number} onClick={() => handleClickLeftTable(number)}>
                {number}
              </td>
              </tr>
            ))}
          </table>
        </div>
      )}
      {rightTableNumbers && rightTableNumbers.length > 0 && (
        <div>
          <h2>Right Table</h2>
          <table border="1" style={{borderCollapse:'collapse'}}>
            {rightTableNumbers.map((number) => (
              <tr>
                  <td key={number}>{number}</td>
              </tr>

            ))}
          </table>
        </div>
      )}
      </div>
      {/* {goalAchieved ? (
        <div>
          <p>Congratulations! You achieved the goal.</p>
          <p>Time taken: {Date.now() - startTime} ms</p>
          <p>Sum of numbers: {rightTableNumbers.reduce((a, b) => a + b, 0)}</p>
        </div>
      ) : (
        <div>
            {rightTableNumbers.length===8?<h2>You are unable to achieve your goal </h2>:''}
        </div>
      )} */}

        <div>
          <p>Goal: Sum of numbers should be greater than or equal to 15600</p>
          <p>Sum of numbers: {rightTableNumbers.reduce((a, b) => a + b, 0)}</p>
        </div>
    </div>
  );
};

export default Table;
