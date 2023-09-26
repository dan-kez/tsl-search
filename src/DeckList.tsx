import { useState } from 'react';
import NavBar from './NavBar';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useMediaQuery, useTheme, Link } from '@mui/material';
import useGetDeckLists from './queries';

const columns: GridColDef[] = [
  { field: 'discord_name', headerName: 'Name', flex: 0.5 },
  { field: 'discord_username', headerName: 'Discord Username', flex: 0.5 },
  {
    field: 'name',
    headerName: 'Moxfield Deck Name',
    flex: 1,
    renderCell: (row) => {
      return (
        <Link
          variant="body1"
          href={`https://www.moxfield.com/decks/${row.row.moxfield_id}`}
          rel="noref"
          target="_blank"
        >
          {row.value}
        </Link>
      );
    },
  },
];

function DeckList() {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up('sm'));
  // Todo Make League Id Dynamic
  const [leagueId] = useState<number>(1);
  const rows = useGetDeckLists({ league_id: leagueId });

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
                // only show this by default on large screens
                discord_username: largeScreen,
              },
            },
          }}
        />
      </div>
    </>
  );
}

export default DeckList;
