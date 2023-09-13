import { useEffect, useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import NavBar from './NavBar';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

interface DeckFilters {
  league_id: number;
}

const getDeckLists = async ({
  league_id,
}: {
  league_id: number;
}): Promise<
  { id: number; name: string; moxfield_id: string; discord_name: string }[]
> => {
  const query = supabase
    .from('decks_with_username')
    .select('id, name, moxfield_id, discord_name')
    .eq('league_id', league_id);

  const { data: decks, error } = await query;

  if (error) {
    console.error(error);
  }
  return decks || [];
};

const columns: GridColDef[] = [
  { field: 'discord_name', headerName: 'Discord User', flex: 0.5 },
  {
    field: 'name',
    headerName: 'Moxfield Deck Name',
    flex: 1,
    renderCell: (row) => {
      return (
        <div className="hover-img">
          <a
            href={`https://www.moxfield.com/decks/${row.row.moxfield_id}`}
            rel="noref"
            target="_blank"
          >
            {row.value}
          </a>
        </div>
      );
    },
  },
];

function DeckList() {
  const [rows, setRows] = useState<
    { name: string; moxfield_id: string; discord_name: string }[]
  >([]);
  const [filters] = useState<DeckFilters>({
    league_id: 1,
  });
  useEffect(() => {
    getDeckLists(filters).then((decks) => {
      setRows(decks);
    });
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ height: '90vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          disableDensitySelector
          disableRowSelectionOnClick
          initialState={{
            columns: {
              columnVisibilityModel: {
                oracle_text: false,
                colors: false,
              },
            },
          }}
        />
      </div>
    </>
  );
}

export default DeckList;
