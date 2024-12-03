import { useState, useEffect } from "react";
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
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [addWeightRecord] = useMutation(ADD_WEIGHT_RECORD, {
    onCompleted: async () => {
      await client.resetStore();
    },
  });

  const [deleteWeightRecord] = useMutation(DELETE_WEIGHT_RECORD, {
    onCompleted: async () => {
      await client.resetStore();
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
      const newRecord = {
        date: formState.date,
        weight: parseFloat(formState.weight),
      };
      setWeightRecords((prevRecords) => [...prevRecords, newRecord]);
      await addWeightRecord({
        variables: {
          petId,
          date: formState.date,
          weight: newRecord.weight,
        },
      });
    } catch (error) {
      console.error("Error adding weight record:", error.message);
    }
  };

  const handleDeleteRecord = async (date) => {
    try {
      setWeightRecords((prevRecords) =>
        prevRecords.filter((record) => record.date !== date)
      );
      await deleteWeightRecord({
        variables: { petId, date },
      });
      setSelectedPoint(null); // Reset the selected point
    } catch (error) {
      console.error("Error deleting weight record:", error.message);
    }
  };

  const handlePointClick = (event, elements, chart) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const record = weightRecords[index];
      setSelectedPoint(record);
    } else {
      setSelectedPoint(null); // Deselect if clicking outside points
    }
  };  

  useEffect(() => {
    if (!loading) {
      if (data?.pet?.health?.weightRecords) {
        setWeightRecords(data.pet.health.weightRecords);
      }
    }
  }, [loading, data]);

  const prepareGraphData = () => {
    const labels = weightRecords.map((record) => record.date);
    const weights = weightRecords.map((record) => record.weight);

    return {
      labels,
      datasets: [
        {
          label: "Weight Over Time",
          data: weights,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          tension: 0.2,
          pointRadius: 6,
          pointHoverRadius: 8,
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
        <Line
          data={prepareGraphData()}
          key={weightRecords.length}
          options={{
            onClick: (event, elements, chart) => handlePointClick(event, elements, chart),
          }}
        />
      </div>
      <div className="add-weight-section">
        {formVisible ? (
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
        ) : (
          <button onClick={handleFormToggle}>Add New Weight</button>
        )}
      </div>
      {selectedPoint && (
        <div className="delete-section">
          <p>
            Selected Date: {selectedPoint.date}, Weight: {selectedPoint.weight} kg
          </p>
          <button 
            className="delete-button" 
            onClick={() => handleDeleteRecord(selectedPoint.date)}
          >
            Delete
          </button>
          <button 
            className="cancel-button" 
            onClick={() => setSelectedPoint(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthLog;








