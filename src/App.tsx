import BabylonCanvas from "./components/BabylonCanvas";
import styles from "./App.module.css";

function App() {

  return (
    <div className={`${styles.app}`}>
      <BabylonCanvas />
    </div>
  );
}

export default App;