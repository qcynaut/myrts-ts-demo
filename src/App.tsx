import React, { useState } from "react";
import {Data, MyRts} from "myrts-ts";
import { UserType } from "myrts-ts/dist/misc/users";

function App() {
  const [myrts, setMyrts] = useState<MyRts | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [broadcast, setBroadcast] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      let myrts = await MyRts.create("wss://socket.myrts.id", true, 10);
      myrts.onData = (data) => {
        setData(data);
      }
      myrts.onDisconnect = () => {
        setMyrts(null);
        setData(null);
      }
      let auth = await myrts.auth("ademr", "Dani");
      if (!auth.success) {
        throw new Error(auth.message);
      }
      setMyrts(myrts);
    } catch (error) {
      setMyrts(null);
      setData(null);
      alert(error);
    }
    setLoading(false);
  }

  const startBroadcast = async () => {
    setLoading(true);
    try {
      let users = data?.users.filter((u) => u.user_type === UserType.Member).map((u) => u.id);
      await myrts?.addMember(users ?? []);
      await myrts?.startBroadcast();
      setBroadcast(true);
    } catch (error) {
      alert(error);
      setBroadcast(false);
      let users = data?.users.filter((u) => u.user_type === UserType.Member).map((u) => u.id);
      myrts?.removeMember(users ?? []).catch((error) => {
        alert(error);
      });
    }
    setLoading(false);
  }

  const stopBroadcast = async () => {
    setLoading(true);
    try {
      await myrts?.stopBroadcast();
      let users = data?.users.filter((u) => u.user_type === UserType.Member).map((u) => u.id);
      await myrts?.removeMember(users ?? []);
      setBroadcast(false);
    } catch (error) {
      alert(error);
      setBroadcast(false);
    }
    setLoading(false);
  }

  const disconnect = async () => {
    setLoading(true);
    try {
      await myrts?.disconnect();
      setMyrts(null);
      setData(null);
      setBroadcast(false);
    } catch (error) {
      alert(error);
    }
    setLoading(false);
  }

  return (
    <div className="w-screen h-screen p-20 flex justify-center items-center">
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <React.Fragment>
          {!myrts && <button onClick={connect} className="bg-blue-500 p-2 rounded-sm">Connect</button>}
          {myrts && !broadcast && (
            <React.Fragment>
              <button onClick={startBroadcast} className="bg-blue-500 p-2 rounded-sm">Start Broadcast</button>
              <button onClick={disconnect} className="bg-red-500 p-2 rounded-sm">Disconnect</button>
            </React.Fragment>
          )}
          {broadcast && (
            <button onClick={stopBroadcast} className="bg-red-500 p-2 rounded-sm">Stop Broadcast</button>
          )}
        </React.Fragment>
      )}
    </div>
  )
}

export default App;