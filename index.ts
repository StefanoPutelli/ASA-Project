// @ts-ignore: Ignore declaration errors
import { DeliverooApi } from "@unitn-asa/deliveroo-js-client";
import Agent from "./agent/Agent";

const client = new DeliverooApi(
    'http://localhost:8080',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjN2U4MyIsIm5hbWUiOiJTdGVwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ0NzE4NjM5fQ.SWP0DNIr_c4jhMy13TfGeXojGLtUyXNuMK5k_XiAZwU'
)

const agent = new Agent(client);

setInterval(() => {
    agent.renderMap();
}, 1000);

