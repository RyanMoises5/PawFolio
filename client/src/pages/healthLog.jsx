import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import { QUERY_PET_HEALTH } from "../utils/queries";
import { ADD_WEIGHT_RECORD, DELETE_WEIGHT_RECORD } from "../utils/mutations";
import Auth from "../utils/auth";
import "./healthLog.css";
import { format } from 'date-fns';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const HealthLog = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { petId } = useParams();
  
  const { loading, data } = useQuery(QUERY_PET_HEALTH, {
    variables: { petId },
  });

  const [weightRecords, setWeightRecords] = useState([]);
  const [formVisible, toggleForm] = useState(false);
  const [formState, setFormState] = useState({
    date: "",
    weight: "",
  });

  const [addWeightRecord] = useMutation(ADD_WEIGHT_RECORD, {
    onCompleted: async () => {
      await client.resetStore(); // Reset the store to refetch all queries
    },
  });
  
  
  const handleFormToggle = () => toggleForm(!formVisible);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const formattedDate = format(new Date(formState.date), "yyyy-MM-dd");
      const newRecord = {
        date: formattedDate,
        weight: parseFloat(formState.weight),
      };
  
      // Update state optimistically
      setWeightRecords((prevRecords) => [...prevRecords, newRecord]);
  
      // Perform the mutation
      await addWeightRecord({
        variables: {
          petId,
          date: formattedDate,
          weight: newRecord.weight,
        },
      });
  
      // Optionally refetch data to ensure backend sync
      console.log("Weight record added successfully.");
    } catch (error) {
      console.error("Error adding weight record:", error.message);
    }
  };
  

  useEffect(() => {
    if (!loading) {
      console.log("Raw data from query:", data);
      if (data?.pet?.health?.weightRecords) {
        setWeightRecords(data.pet.health.weightRecords);
        console.log("Set weightRecords:", data.pet.health.weightRecords);
      }
    }
  }, [loading, data]);
  


  const prepareGraphData = () => {
    console.log("Current weightRecords:", weightRecords);
  
    const labels = weightRecords.map((record) =>
      new Date(record.date).toLocaleDateString()
    );
    const weights = weightRecords.map((record) => record.weight);
  
    console.log("Labels:", labels); // Expect an array of dates
    console.log("Weights:", weights); // Expect an array of numbers
  
    return {
      labels,
      datasets: [
        {
          label: "Weight Over Time",
          data: weights,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    };
  };  
  

  if (!Auth.loggedIn()) {
    return (
      <>
        <div>Please sign in or make an account.</div>
        <button onClick={() => navigate("/")}>Return Home</button>
      </>
    );
  }

  return (
    <div>
      <h1>{`${data?.pet?.name}'s Health Log`}</h1>
      <div className="weight-graph">
      <Line data={prepareGraphData()} key={weightRecords.length} />
      </div>
      <div className="add-weight-section">
        {formVisible ? (
          <>
            <form onSubmit={handleFormSubmit}>
              <input
                type="date"
                name="date"
                value={formState.date}
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="weight"
                step="0.1"
                value={formState.weight}
                onChange={handleFormChange}
                placeholder="Weight (kg)"
                required
              />
              <button type="submit">Add Weight</button>
              <button onClick={handleFormToggle} type="button">
                Cancel
              </button>
            </form>
          </>
        ) : (
          <button onClick={handleFormToggle}>Add New Weight</button>
        )}
      </div>
    </div>
  );
};

export default HealthLog;








