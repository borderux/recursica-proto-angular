import { Routes, Route } from "react-router";
import Home from "./routes/Home";
import { prototypes } from "./routes/prototypes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {prototypes.map(({ slug, Component }) => (
        <Route
          key={slug}
          path={`/prototypes/${slug}`}
          element={<Component />}
        />
      ))}
    </Routes>
  );
}

export default App;
