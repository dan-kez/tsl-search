import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import ColorFilters from './ColorFilters';
import { Box } from '@mui/material';

const CustomToolbar = ({
  setFilterModel,
  largeScreen,
}: {
  setFilterModel: any;
  largeScreen: boolean;
}) => {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <div>
        <ColorFilters setFilterModel={setFilterModel} />
      </div>
      <Box flex={1} />
      <div>
        {largeScreen && <GridToolbarColumnsButton />}
        <GridToolbarFilterButton />
      </div>
    </GridToolbarContainer>
  );
};
export default CustomToolbar;
