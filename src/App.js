import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import "./App.scss";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState, useEffect } from "react";

const Tag = ({ type, label, style, onClose }) => {
  return (
    <span className={`tag ${type}`} style={style}>
      {label}
      {type === "player" && (
        <CloseIcon className="close-btn" onClick={onClose} />
      )}
    </span>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

function App() {
  const [playersText, setPlayersText] = useState("");
  const [players, setPlayers] = useState([]);
  const [randomizedPlayers, setRandomizedPlayers] = useState([]);
  const [teamsAmount, setTeamsAmount] = useState(2);
  const [teams, setTeams] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [formattedResults, setFormattedResults] = useState("");
  const [copy, setCopy] = useState(false);

  const onTextChange = (e) => {
    setPlayersText(e.target.value);

    textToPlayers(e.target.value);
  };

  const textToPlayers = (text) => {
    if (text === "") {
      setPlayers([]);
    } else {
      const newText = text.replace(/\n/g, ",");

      setPlayers(newText.split(/\s*,\s*/));
    }
  };

  const savePlayers = (players) => {
    const localPlayers = formattedPlayers("players");
    const set = new Set([...localPlayers, ...players]);
    setHistory({
      lastPlayers: players,
      allPlayers: [...set],
    });

    localStorage.setItem("lastPlayers", JSON.stringify(players));
    localStorage.setItem("players", JSON.stringify([...set]));
  };

  const playerTags = () => {
    const tags = [];
    const deletePlayer = (player) => {
      // Set players
      const curPlayers = players.slice();
      curPlayers.splice(curPlayers.indexOf(player), 1);
      setPlayers(curPlayers);

      // Set players text
      const text = curPlayers.join(",");
      setPlayersText(text);
    };

    players.forEach((player, idx) =>
      tags.push(
        <Tag
          type="player"
          label={player}
          key={idx}
          onClose={() => deletePlayer(player)}
        />
      )
    );
    return <div className="tags">{tags}</div>;
  };

  const randomize = () => {
    const results = [];
    const stack = players.slice();

    while (stack.length > 0) {
      const randomIndex = Math.floor(Math.random() * stack.length);
      results.push(stack[randomIndex]);
      stack.splice(randomIndex, 1);
    }
    setRandomizedPlayers(results);
    updateTeams(results);

    savePlayers(results);
  };

  const updateTeams = (randomnizedPlayers) => {
    const stack = randomnizedPlayers.slice();
    const teamSize = Math.floor(stack.length / teamsAmount);
    let remaining =
      stack.length % (Math.floor(stack.length / teamsAmount) * teamsAmount);

    const newTeams = [];
    for (let j = 0; j < teamsAmount; j++) {
      const team = [];
      for (let i = 0; i < teamSize; i++) {
        team.push(stack.pop());
      }
      if (remaining > 0) {
        team.push(stack.pop());

        remaining--;
      }

      newTeams.push(team);
    }
    formatResults(newTeams);
    setTeams(newTeams);
  };

  const result = () => {
    const teamColor = (idx) => {
      switch (idx) {
        case 0:
          return { backgroundColor: "#8b9af0" };
        case 1:
          return { backgroundColor: "#aa80d1" };
        default:
          return {};
      }
    };

    const teamsElems = [];
    teams.forEach((team, j) => {
      const teamElems = [];
      team.forEach((player, i) => {
        teamElems.push(
          <Tag
            type="member"
            label={player}
            key={`${j}-${i}`}
            style={teamColor(j)}
          />
        );
      });

      teamsElems.push(
        <div className="team" key={j}>
          <h5>Team {j + 1}</h5>
          <div className="members">{teamElems}</div>
        </div>
      );
    });

    return <div className="results">{teamsElems}</div>;
  };

  const formatResults = (teams) => {
    let text = "";
    for (let i = 0; i < teams.length; i++) {
      let results = `Team ${i + 1}: `;

      teams[i].forEach((player, idx) => {
        results += `${player}${idx < teams[i].length - 1 ? ", " : ""}`;
      });
      text += `${results}\n`;
    }
    setFormattedResults(text);
  };

  const plainTextResults = () => {
    const teamsList = [];

    const list = formattedResults.split(/\n/g);
    for (let i = 0; i < list.length; i++) {
      teamsList.push(<div key={i}>{list[i]}</div>);
    }

    return <div className="results">{teamsList}</div>;
  };

  const copyResultsText = (discord) => {
    if (discord) {
      navigator.clipboard.writeText("```\n" + formattedResults + "\n```");
    } else {
      navigator.clipboard.writeText(formattedResults);
    }

    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 1500);
  };

  const formattedPlayers = (keyName) => {
    const data = localStorage.getItem(keyName);
    if (data) {
      if (Array.isArray(JSON.parse(data))) {
        return JSON.parse(data);
      } else {
        return [];
      }
    }
    return [];
  };

  const assignPlayers = (newPlayers) => {
    const newText = newPlayers.join(",");
    if (players.length > 0) {
      setPlayersText(playersText + "," + newText);
      textToPlayers(playersText + "," + newText);
    } else {
      setPlayersText(newText);
      textToPlayers(newText);
    }
  };

  const lastPlayers = () => {
    const playersTags = [];

    const deletePlayer = (player) => {
      const curLastPlayers = history.lastPlayers;
      curLastPlayers.splice(curLastPlayers.indexOf(player), 1);
      setHistory({
        ...history,
        lastPlayers: curLastPlayers,
      });

      localStorage.setItem("lastPlayers", JSON.stringify(curLastPlayers));
    };

    history.lastPlayers.forEach((player, idx) => {
      playersTags.push(
        <Tag
          type="player"
          label={player}
          key={idx}
          style={{ backgroundColor: "#9ee6c5" }}
          onClose={() => deletePlayer(player)}
        />
      );
    });

    return playersTags.length > 0 ? (
      <div className="last-players">
        <h4>Last players:</h4>
        <div className="tags">{playersTags}</div>
        <button
          className="btn assign"
          onClick={() => assignPlayers(history.lastPlayers)}
        >
          Assign players
        </button>
      </div>
    ) : (
      <></>
    );
  };

  const allPlayers = () => {
    const playersTags = [];

    const deletePlayer = (player) => {
      const curAllPlayers = history.allPlayers;
      curAllPlayers.splice(curAllPlayers.indexOf(player), 1);
      setHistory({
        ...history,
        allPlayers: curAllPlayers,
      });

      localStorage.setItem("players", JSON.stringify(curAllPlayers));
    };

    history.allPlayers.forEach((player, idx) => {
      playersTags.push(
        <Tag
          type="player"
          label={player}
          key={idx}
          style={{ backgroundColor: "#edcaad" }}
          onClose={() => deletePlayer(player)}
        />
      );
    });

    return playersTags.length > 0 ? (
      <div className="all-players">
        <h4>All players:</h4>
        <button
          className="btn assign"
          onClick={() => assignPlayers(history.allPlayers)}
          style={{ marginBottom: "16px" }}
        >
          Assign players
        </button>
        <div className="tags">{playersTags}</div>
      </div>
    ) : (
      <></>
    );
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    setLoading(true);
    setHistory({
      lastPlayers: formattedPlayers("lastPlayers"),
      allPlayers: formattedPlayers("players"),
    });
    setLoading(false);
  }, []);

  return (
    <div id="home">
      <div id="team-maker-container">
        <h1>Team maker</h1>
        <div className="settings">
          <label>Teams:</label>
          <input
            type="number"
            className="teams-amount"
            value={teamsAmount}
            onChange={(e) => setTeamsAmount(e.target.value)}
          />
        </div>
        <textarea
          className="players"
          value={playersText}
          onChange={onTextChange}
        ></textarea>
        {playerTags()}
        <button className="btn randomize" onClick={randomize}>
          Randomize
        </button>
        {result()}
        {teams.length > 0 && (
          <div className="results-texts">
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Plain" {...a11yProps(0)} />
              <Tab label="Discord" {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={value} index={0}>
              <div className="copy">
                <ContentCopyIcon
                  className="copy-btn"
                  onClick={() => copyResultsText(false)}
                />
                {copy && <div className="copied">COPIED</div>}
              </div>
              <div className="discord-code">{plainTextResults()}</div>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <div className="copy">
                <ContentCopyIcon
                  className="copy-btn"
                  onClick={() => copyResultsText(true)}
                />
                {copy && <div className="copied">COPIED</div>}
              </div>
              <div className="discord-code">
                <div>```</div>
                {plainTextResults()}
                <div>```</div>
              </div>
            </TabPanel>
          </div>
        )}
      </div>
      {!loading && (
        <div className="history">
          {lastPlayers()}
          {allPlayers()}
        </div>
      )}
    </div>
  );
}

export default App;
