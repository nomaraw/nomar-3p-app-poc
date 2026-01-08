import React, { useEffect, useState } from 'react'
import './App.css'
import { fetchDirectoryPersons } from './utilities/helpers/apiUtils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type Person = {
  name: string;
  initial: string;
};

function App() {
  const [persons, setPersons] = useState<Person[] | null>(null);

  const fetchPersons = async (signal: AbortSignal) => {
    try {
      const result = await fetchDirectoryPersons(signal);

      const rows = Array.isArray(result.items) ? result.items : result?.persons ?? result?.data ?? [];

      setPersons(rows);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPersons(signal);

    return () => {
      controller.abort();
    }
  }, []);

  if (persons === null) return <div>Loading...</div>;

  return (
    <React.Fragment>
      <h4>Directory Listing</h4>

      <DataTable value={persons} stripedRows paginator rows={10}>
        <Column field="name" header="Name"></Column>
        <Column field="id" header="ID"></Column>
      </DataTable>
    </React.Fragment>
  )
}

export default App
