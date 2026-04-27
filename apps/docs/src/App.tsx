import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MarkdownPage } from './components/MarkdownPage';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="*" element={<MarkdownPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
