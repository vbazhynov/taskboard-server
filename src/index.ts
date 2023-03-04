import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { lists } from "./assets/mockData";
import { Database } from "./data/database";
import { CardHandler } from "./handlers/card.handler";
import { ListHandler } from "./handlers/list.handler";
import { ErrorLogger } from "./loggers/error.logger";
import { ReorderService } from "./services/reorder.service";
import { eventLogger } from "./handlers/list.handler";
import { ProxyLogger } from "./loggers/reorder.logger";

const PORT = process.env.PORT || 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const db = Database.Instance;
const reorderService = new ProxyLogger(new ReorderService());

// if (process.env.NODE_ENV !== 'production') {
db.setData(lists);
// }
const onConnection = (socket: Socket): void => {
  new ListHandler(io, db, reorderService).handleConnection(socket);
  new CardHandler(io, db, reorderService).handleConnection(socket);
};

const errorLogger = new ErrorLogger();

eventLogger.subscribe(errorLogger);

io.on("connection", onConnection);

httpServer.listen(PORT, () => console.log("listening on port: " + PORT));

export { httpServer };
