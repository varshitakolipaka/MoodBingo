import React from 'react'
import ReactDOM from 'react-dom'
import './Game.css'

let Game = () => {
    
    let n=16, i=-1, j=0, s='';

    while(++i<n) {
      s+= '<div class="row">'
      for(j=0; j<n; j++) s+= `<div class="cell"> ${(i*n+j).toString(16)} </div>`;
      s+= '</div>'
    }
    
    return (
        <div>
            {s}
        </div>
    )
}

export default Game;