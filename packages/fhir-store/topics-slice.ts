import { createSlice } from "@reduxjs/toolkit";
import { Topic } from "@topical-ehr/topics/Topic";

export const topicsSlice = createSlice({
    name: "topics",
    initialState: {
        topics: [] as Topic[],
    },
    reducers: {
        setTopics(state, action: { payload: Topic[] }) {
            state.topics = action.payload;
        },
    },
});

export const topicsActions = topicsSlice.actions;
