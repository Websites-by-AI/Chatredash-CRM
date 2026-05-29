/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <div className="selection:bg-indigo-100 min-h-screen">
        <Layout />
      </div>
    </ThemeProvider>
  );
}
