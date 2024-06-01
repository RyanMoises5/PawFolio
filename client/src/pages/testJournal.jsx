import TestInfo from '../components/testInfo';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { QUERY_PET_HEALTH } from '../utils/queries';

const TestJournal = () => {
  const { petId } = useParams();
  const { loading, data } = useQuery(QUERY_PET_HEALTH, {
    variables: { petId: petId }
  })

  if (loading) {
    return <div>Fetching pet data...</div>;
  }


  // Add Auth here

  return (
    <div>
        <TestInfo pet={data.pet}/>
    </div>
  )
}

export default TestJournal;