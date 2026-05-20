import React, { useState } from "react";
import axios from "axios";

const TestPage: React.FC = () => {

    const [name, setName] = useState<string>("");
    const [fetchedName, setFetchedName] = useState<string>("");

    const handleSubmit = async (): Promise<void> => {

        try {
            const response = await axios.post(
                "http://localhost:8000/api/test/dbtest",
                {
                    name: name
                }
            );
            console.log(response.data);
            alert("Saved Successfully");
        } catch (error) {
            console.error(error);
            alert("Save Failed");
        }
    };


    // FETCH
    const handleFetch = async (): Promise<void> => {

        try {

            const response = await axios.get(
                "http://localhost:8000/api/test/dbtest"
            );

            console.log(response.data);

            setFetchedName(response.data.name);

        } catch (error) {

            console.error(error);

            alert("Fetch Failed");
        }
    };


    return (

        <div style={{ padding: "20px" }}>

            <h1>Test Page</h1>

            <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <button onClick={handleSubmit}>
                Submit
            </button>

            <hr />

            <button onClick={handleFetch}>
                Fetch Name
            </button>

            <h2>{fetchedName}</h2>

        </div>
    );
};

export default TestPage;