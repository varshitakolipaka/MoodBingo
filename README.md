# MoodBingo


## Abstract
A heuristic based multiplayer game of bingo with server rooms and customised prompts. The game brings together communities and puts a stake on telling the truth victory!

---
## Installation

To locally install it on your machine, run the following script written below on the terminal. Ensure that after cloning the repo, you change your working directory to MoodBingo directory.
```sh
 git clone https://github.com/varshitakolipaka/MoodBingo.git
 cd server
 nodemon server.js
```
<br>
The game is also hosted on Heroku. Join the link below and get ready to play!
<br>
Link: https://mood-bingo.herokuapp.com/

---

## About the Game

The game is a never before seen mix of our favourite board games "Never Have I Ever" and "Bingo!". The player is presented on a set of never have I ever prompts in a traditional bingo setting. 

Each round a random card is chosen and players race against each other to raise hands and get a chance to bag the card. The player who raised their hands first has to now convince his fellow rivals that he indeed is deserving of the card before the voting round ends. 

The player who wins a row ,column or diagonal first wins the game! 

---

## How to Play

### Getting Started!

You can choose your presets, set the number of rows of the bingo board and set the voting time and you are ready to go!

Once you create the room you will enter the Lobby area and get the room ID. Share the ID with your friends who can paste the room ID and press JOIN.

Chill in the Lobby and message and chat with your friends. Once everyone has arrived press START GAME and play!

Add Custom Presets too!. Name your presets and type in at least 9 prompts for a good (3x3 board) game. Then press ADD. While creating the room just add in the preset name you created and you are ready to go!

### Default Presets Available :)

* **School Vibes :** Ready to cherish old school memories this is the perfect preset for you! (max: 3 rows)
* **Stranger Danger :** Wanting to know your new friends better. Get ready for loads of fun and revelations. (max: 3 rows)
* **Girls Night Out :** Self explanatory. Get ready to have your quality girls night out moodbingo style! (max: 3 rows)
* **Family Time :** Having a chill out day with your family. What better way to spend the day playing MoodBingo! (max: 3 rows)

### The Rules :!:

 A card is highlighted at the beginning of each round. The player who has actually done / had experienced "the never have I ever" prompt races to RAISE HANDS. The player who selets first gets a chance to bag the card.
 
The voting round then starts and the player who had raised hands has the custom voting time available to convince the others of their experience. The other players then proceed to vote either yes/no (only the last choice before the end of the round for each player is counted. You are free to change your mind and modify your vote during the course of the voting time!)

If majority votes yes, the player wins the card. The first player to complete either a row, column or diagonal wins the game!

 **Most impostant rule of all is to have fun all the way! :)**
 
 ---
 
## Developer's Section

The repository consists of 2 parts the client and the server. The client directory consists of the main frontend script client.js along with other assets such as index.hbs and styles folder constaining css.

The server directory consists of server.js (the main backend server script), views (the handlebar templates), server_utility (local modules), data (containing preset json).




