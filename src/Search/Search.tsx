import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
} from '@mui/x-data-grid';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ManaCost from './ManaCost';
import PageShell from '../PageShell';
import CustomToolbar from './CustomToolbar';

interface CardResponse {
  deck: {
    name: string;
    moxfield_id: string;
  };
  oracle_card: {
    oracle_id: string;
    scryfall_id: string;
    colors: string[];
    name: string;
    oracle_text: string;
    type_line: string;
    image_uri: string;
    mana_cost: string;
  };
}

interface RowToRender {
  oracle_id: string;
  scryfall_id: string;
  colors: string[];
  image_uri: string;
  mana_cost: string;
  name: string;
  oracle_text: string;
  type_line: string;
}

const getDistinctOracleIdByLeagueId = async (
  league_id: number
): Promise<CardResponse[]> => {
  const query = supabase
    .from('distinct_oracle_id_by_league_id')
    .select(
      `
      oracle_card:oracle_id!inner (
        oracle_id:id,
        colors,
        image_uri,
        mana_cost,
        name,
        oracle_text,
        type_line,
        scryfall_id
      )
    `
    )
    .eq('league_id', league_id);

  const { data: cardResponses, error } = await query;
  if (error) {
    console.error(error);
  }
  // @ts-expect-error
  return cardResponses || [];
};

const getDecksWithCard = async ({
  league_id,
  oracle_id,
}: {
  league_id: number;
  oracle_id: string;
}): Promise<
  {
    name: string;
    moxfield_id: string;
    discord_name: string;
    quantity: number;
  }[]
> => {
  const query = supabase
    .from('card_pool_oracle_with_username')
    .select('name, moxfield_id, discord_name, quantity')
    .eq('league_id', league_id)
    .eq('oracle_id', oracle_id);

  const { data: decks, error } = await query;

  if (error) {
    console.error(error);
  }
  // @ts-expect-error
  return decks || [];
};

const DecksWithCardDrawer = ({
  league_id,
  oracle_id,
  closeModal,
}: {
  league_id: number;
  oracle_id: string;
  closeModal: Function;
}) => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up('sm'));

  const [decks, setDecks] = useState<
    { moxfield_id: string; discord_name: string; quantity: number }[]
  >([]);
  useEffect(() => {
    getDecksWithCard({ league_id, oracle_id }).then((decks) => {
      setDecks(decks);
    });
  }, [league_id, oracle_id]);
  return (
    <Drawer
      PaperProps={{
        sx: { width: largeScreen ? '25%' : '80%' },
      }}
      anchor="right"
      open={true}
      onClose={() => closeModal()}
    >
      <List>
        {decks.map(({ moxfield_id, discord_name, quantity }) => (
          <ListItem key={moxfield_id} disablePadding>
            <ListItemButton
              onClick={() => {
                window.open(`https://www.moxfield.com/decks/${moxfield_id}`);
              }}
            >
              <ListItemText primary={`${quantity}x ${discord_name}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

const columns: GridColDef[] = [
  {
    field: 'oracle_id',
    headerName: 'Action',
    minWidth: 100,
    filterable: false,
    renderCell: (row) => {
      const [modalOpen, setModalOpen] = useState(false);
      return (
        <>
          <button onClick={() => setModalOpen(true)}>Owners</button>
          {modalOpen && (
            <DecksWithCardDrawer
              league_id={1}
              oracle_id={row.value}
              closeModal={() => setModalOpen(false)}
            />
          )}
        </>
      );
    },
  },
  {
    field: 'name',
    headerName: 'Card Name',
    flex: 1,
    renderCell: (row) => {
      return (
        <div className="hover-img">
          <ManaCost mana_cost={row.row.mana_cost} />
          <a
            href={`https://scryfall.com/cards/${row.row.scryfall_id}`}
            rel="noref"
            target="_blank"
          >
            &nbsp;{row.value}
            <span>
              <img src={row.row.image_uri} alt="scryfall image" />
            </span>
          </a>
        </div>
      );
    },
  },
  { field: 'oracle_text', headerName: 'Oracle Text', flex: 0.5 },
  { field: 'type_line', headerName: 'Type', flex: 0.5 },
  {
    field: 'colors',
    headerName: 'Colors',
    flex: 0.5,
  },
];

function Search() {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [rows, setRows] = useState<RowToRender[]>([]);
  // TODO: Enable filtering by League Id
  const [leagueId] = useState<number>(1);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  useEffect(() => {
    getDistinctOracleIdByLeagueId(leagueId).then((data) => {
      setRows(
        data.map(({ oracle_card }) => ({
          ...oracle_card,
        }))
      );
    });
  }, [leagueId]);

  return (
    <PageShell>
      <div style={{ height: '90vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.oracle_id}
          slotProps={{
            toolbar: {
              setFilterModel,
              largeScreen,
            },
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          density="comfortable"
          disableDensitySelector
          disableRowSelectionOnClick
          initialState={{
            columns: {
              columnVisibilityModel: {
                oracle_text: false,
                colors: false,
                // only show this by default on large screens
                type_line: largeScreen,
              },
            },
          }}
        />
      </div>
    </PageShell>
  );
}

export default Search;
