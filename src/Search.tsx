import { useEffect, useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import NavBar from './NavBar';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

interface CardResponse {
  deck: {
    name: string;
    moxfield_id: string;
  };
  scryfall_card: {
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
  scryfall_id: string;
  colors: string[];
  image_uri: string;
  mana_cost: string;
  name: string;
  oracle_text: string;
  type_line: string;
}

interface CardFilters {
  colors?: string[];
  name?: string;
  oracle_text?: string;
  type_line?: string;
  league_id: number;
}

const getDistinctScryfallByLeagueId = async (
  filters: CardFilters
): Promise<CardResponse[]> => {
  const query = supabase
    .from('distinct_scryfall_id_by_league_id')
    .select(
      `scryfall_card:scryfall_id!inner ( scryfall_id:id ,colors,image_uri,mana_cost,name,oracle_text,type_line )`
    )
    .eq('league_id', filters.league_id);
  const { data: cardResponses, error } = await query;
  if (error) {
    console.error(error);
  }
  console.log(cardResponses);
  // @ts-expect-error
  return cardResponses || [];
};

const getDecksWithCard = async ({
  league_id,
  scryfall_id,
}: {
  league_id: number;
  scryfall_id: string;
}): Promise<{ deck: { name: string; moxfield_id: string } }[]> => {
  const query = supabase
    .from('card_pool')
    .select('deck( name, moxfield_id )')
    .eq('deck.league_id', league_id)
    .eq('scryfall_id', scryfall_id);

  const { data: decks, error } = await query;
  if (error) {
    console.error(error);
  }
  console.log(decks);
  // @ts-expect-error
  return decks || [];
};

const DecksWithCardDrawer = ({
  league_id,
  scryfall_id,
  closeModal,
}: {
  league_id: number;
  scryfall_id: string;
  closeModal: Function;
}) => {
  const [decks, setDecks] = useState<{ name: string; moxfield_id: string }[]>(
    []
  );
  useEffect(() => {
    getDecksWithCard({ league_id, scryfall_id }).then((decks) => {
      setDecks(decks.map(({ deck }) => deck));
    });
  }, []);
  return (
    <Drawer anchor="right" open={true} onClose={() => closeModal()}>
      <List>
        {decks.map(({ moxfield_id, name: deckName }) => (
          <ListItem key={moxfield_id} disablePadding>
            <ListItemButton
              onClick={() => {
                window.open(`https://www.moxfield.com/decks/${moxfield_id}`);
              }}
            >
              <ListItemText primary={deckName} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

const columns: GridColDef[] = [
  {
    field: 'scryfall_id',
    headerName: 'Action',
    minWidth: 150,
    renderCell: (row) => {
      const [modalOpen, setModalOpen] = useState(false);
      return (
        <>
          <button onClick={() => setModalOpen(true)}>See Owners</button>
          {modalOpen && (
            <DecksWithCardDrawer
              league_id={1}
              scryfall_id={row.value}
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
          <a
            href={`https://scryfall.com/cards/${row.id}`}
            rel="noref"
            target="_blank"
          >
            {row.value}
            <span>
              <img src={row.row.image_uri} alt="scryfall image" height={300} />
            </span>
          </a>
        </div>
      );
    },
  },
  { field: 'mana_cost', headerName: 'Mana Cost', flex: 0.5 },
  { field: 'oracle_text', headerName: 'Oracle Text', flex: 0.5 },
  { field: 'type_line', headerName: 'Type', flex: 0.5 },
  { field: 'colors', headerName: 'Colors', flex: 0.5 },
];

function Search() {
  const [rows, setRows] = useState<RowToRender[]>([]);
  // TODO: Enable filtering by League Id
  const [filters] = useState<CardFilters>({
    league_id: 1,
  });
  useEffect(() => {
    getDistinctScryfallByLeagueId(filters).then((data) => {
      setRows(
        data.map(({ scryfall_card }) => ({
          ...scryfall_card,
        }))
      );
    });
  }, [JSON.stringify(filters)]);

  return (
    <>
      <NavBar />
      <div style={{ height: '90vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.scryfall_id}
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

export default Search;
