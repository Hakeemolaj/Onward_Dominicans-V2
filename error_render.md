2025-06-10T06:48:56.071581191Z    | 
2025-06-10T06:48:56.071584881Z 
2025-06-10T06:48:56.071588612Z Validation Error Count: 1
2025-06-10T06:48:56.071592802Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:48:56.071596842Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:48:56.071611584Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:48:56.071614154Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:48:56.071616244Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:48:56.071618954Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:48:56.071620964Z   clientVersion: '6.9.0',
2025-06-10T06:48:56.071623495Z   errorCode: undefined,
2025-06-10T06:48:56.071625515Z   retryable: undefined
2025-06-10T06:48:56.071631125Z }
2025-06-10T06:49:06.069742855Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:06.069776937Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:06.069781528Z 
2025-06-10T06:49:06.069785398Z 
2025-06-10T06:49:06.069789889Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:06.069794499Z   -->  schema.prisma:10
2025-06-10T06:49:06.069798309Z    | 
2025-06-10T06:49:06.06980344Z  9 |   provider = "sqlite"
2025-06-10T06:49:06.0698074Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:06.06981116Z    | 
2025-06-10T06:49:06.06981476Z 
2025-06-10T06:49:06.069818471Z Validation Error Count: 1
2025-06-10T06:49:06.069823001Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:06.069827081Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:06.069831362Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:06.069835302Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:06.069838993Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:06.069843493Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:06.069847393Z   clientVersion: '6.9.0',
2025-06-10T06:49:06.069851254Z   errorCode: undefined,
2025-06-10T06:49:06.069855214Z   retryable: undefined
2025-06-10T06:49:06.069859004Z }
2025-06-10T06:49:06.069898907Z prisma:error 
2025-06-10T06:49:06.069906908Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:06.069910959Z 
2025-06-10T06:49:06.069914809Z 
2025-06-10T06:49:06.069919029Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:06.069923509Z   -->  schema.prisma:10
2025-06-10T06:49:06.0699274Z    | 
2025-06-10T06:49:06.06993135Z  9 |   provider = "sqlite"
2025-06-10T06:49:06.06993535Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:06.069939531Z    | 
2025-06-10T06:49:06.069943211Z 
2025-06-10T06:49:06.069947031Z Validation Error Count: 1
2025-06-10T06:49:06.070545951Z 10.219.27.208 - - [10/Jun/2025:06:49:06 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:49:16.070462223Z prisma:error 
2025-06-10T06:49:16.070483855Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:16.070488456Z 
2025-06-10T06:49:16.070492546Z 
2025-06-10T06:49:16.070497437Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:16.070518748Z   -->  schema.prisma:10
2025-06-10T06:49:16.070523779Z    | 
2025-06-10T06:49:16.070529259Z  9 |   provider = "sqlite"
2025-06-10T06:49:16.07054627Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:16.070549621Z    | 
2025-06-10T06:49:16.070552361Z 
2025-06-10T06:49:16.070555181Z Validation Error Count: 1
2025-06-10T06:49:16.070574383Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:16.070577883Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:16.070580353Z 
2025-06-10T06:49:16.070582753Z 
2025-06-10T06:49:16.070585554Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:16.070588324Z   -->  schema.prisma:10
2025-06-10T06:49:16.070590824Z    | 
2025-06-10T06:49:16.070593934Z  9 |   provider = "sqlite"
2025-06-10T06:49:16.070596805Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:16.070599395Z    | 
2025-06-10T06:49:16.070601635Z 
2025-06-10T06:49:16.070604115Z Validation Error Count: 1
2025-06-10T06:49:16.070608255Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:16.070611306Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:16.070616376Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:16.070619076Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:16.070621717Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:16.070625777Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:16.070628447Z   clientVersion: '6.9.0',
2025-06-10T06:49:16.070631177Z   errorCode: undefined,
2025-06-10T06:49:16.070633758Z   retryable: undefined
2025-06-10T06:49:16.070636218Z }
2025-06-10T06:49:16.071170032Z 10.219.27.208 - - [10/Jun/2025:06:49:16 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:49:26.071155575Z prisma:error 
2025-06-10T06:49:26.071182747Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:26.071187337Z 
2025-06-10T06:49:26.071191128Z 
2025-06-10T06:49:26.071196008Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:26.071200288Z   -->  schema.prisma:10
2025-06-10T06:49:26.071203999Z    | 
2025-06-10T06:49:26.071208929Z  9 |   provider = "sqlite"
2025-06-10T06:49:26.071212729Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:26.0712165Z    | 
2025-06-10T06:49:26.07122Z 
2025-06-10T06:49:26.07122385Z Validation Error Count: 1
2025-06-10T06:49:26.071436288Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:26.071444818Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:26.071448679Z 
2025-06-10T06:49:26.071452099Z 
2025-06-10T06:49:26.07145639Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:26.07146109Z   -->  schema.prisma:10
2025-06-10T06:49:26.07146469Z    | 
2025-06-10T06:49:26.07146928Z  9 |   provider = "sqlite"
2025-06-10T06:49:26.071472901Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:26.071476611Z    | 
2025-06-10T06:49:26.071480041Z 
2025-06-10T06:49:26.071483422Z Validation Error Count: 1
2025-06-10T06:49:26.071487712Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:26.071491413Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:26.071508284Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:26.071510854Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:26.071513074Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:26.071516644Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:26.071518785Z   clientVersion: '6.9.0',
2025-06-10T06:49:26.071520735Z   errorCode: undefined,
2025-06-10T06:49:26.071522765Z   retryable: undefined
2025-06-10T06:49:26.071524875Z }
2025-06-10T06:49:26.072125255Z 10.219.27.208 - - [10/Jun/2025:06:49:26 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:49:36.069986156Z prisma:error 
2025-06-10T06:49:36.070013458Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:36.070016638Z 
2025-06-10T06:49:36.070044851Z 
2025-06-10T06:49:36.070050831Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:36.070056052Z   -->  schema.prisma:10
2025-06-10T06:49:36.070060552Z    | 
2025-06-10T06:49:36.070065843Z  9 |   provider = "sqlite"
2025-06-10T06:49:36.070070343Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:36.070074763Z    | 
2025-06-10T06:49:36.070078894Z 
2025-06-10T06:49:36.070083274Z Validation Error Count: 1
2025-06-10T06:49:36.070103656Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:36.070112586Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:36.070117377Z 
2025-06-10T06:49:36.070121417Z 
2025-06-10T06:49:36.070126648Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:36.070131958Z   -->  schema.prisma:10
2025-06-10T06:49:36.070136388Z    | 
2025-06-10T06:49:36.070141389Z  9 |   provider = "sqlite"
2025-06-10T06:49:36.070145769Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:36.07015053Z    | 
2025-06-10T06:49:36.0701551Z 
2025-06-10T06:49:36.07015803Z Validation Error Count: 1
2025-06-10T06:49:36.070161501Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:36.070164361Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:36.070167941Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:36.070170761Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:36.070173491Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:36.070176842Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:36.070179632Z   clientVersion: '6.9.0',
2025-06-10T06:49:36.070182462Z   errorCode: undefined,
2025-06-10T06:49:36.070185232Z   retryable: undefined
2025-06-10T06:49:36.070188083Z }
2025-06-10T06:49:36.070552153Z 10.219.27.208 - - [10/Jun/2025:06:49:36 +0000] "GET /api/health HTTP/1.1" 503 241 "-" "Render/1.0"
2025-06-10T06:49:46.069669202Z prisma:error 
2025-06-10T06:49:46.069700325Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:46.069704625Z 
2025-06-10T06:49:46.069708286Z 
2025-06-10T06:49:46.069713006Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:46.069733437Z   -->  schema.prisma:10
2025-06-10T06:49:46.069735928Z    | 
2025-06-10T06:49:46.069739008Z  9 |   provider = "sqlite"
2025-06-10T06:49:46.069741798Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:46.069743868Z    | 
2025-06-10T06:49:46.069745729Z 
2025-06-10T06:49:46.069751429Z Validation Error Count: 1
2025-06-10T06:49:46.069784502Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:46.069791762Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:46.069793813Z 
2025-06-10T06:49:46.069795653Z 
2025-06-10T06:49:46.069797953Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:46.069800593Z   -->  schema.prisma:10
2025-06-10T06:49:46.069802253Z    | 
2025-06-10T06:49:46.069804673Z  9 |   provider = "sqlite"
2025-06-10T06:49:46.069806414Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:46.069808424Z    | 
2025-06-10T06:49:46.069810684Z 
2025-06-10T06:49:46.069813614Z Validation Error Count: 1
2025-06-10T06:49:46.069816734Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:46.069819485Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:46.069837646Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:46.069839556Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:46.069841196Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:46.069844517Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:46.069846487Z   clientVersion: '6.9.0',
2025-06-10T06:49:46.069848507Z   errorCode: undefined,
2025-06-10T06:49:46.069850277Z   retryable: undefined
2025-06-10T06:49:46.069852067Z }
2025-06-10T06:49:46.070331127Z 10.219.27.208 - - [10/Jun/2025:06:49:46 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:49:56.070009396Z prisma:error 
2025-06-10T06:49:56.070031498Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:56.070034539Z 
2025-06-10T06:49:56.070037159Z 
2025-06-10T06:49:56.070040719Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:56.070044549Z   -->  schema.prisma:10
2025-06-10T06:49:56.07004768Z    | 
2025-06-10T06:49:56.07005116Z  9 |   provider = "sqlite"
2025-06-10T06:49:56.07005391Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:56.07005637Z    | 
2025-06-10T06:49:56.07005868Z 
2025-06-10T06:49:56.070061671Z Validation Error Count: 1
2025-06-10T06:49:56.070128206Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:49:56.070157609Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:49:56.070161739Z 
2025-06-10T06:49:56.070164429Z 
2025-06-10T06:49:56.070167279Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:49:56.07016998Z   -->  schema.prisma:10
2025-06-10T06:49:56.07017256Z    | 
2025-06-10T06:49:56.07017539Z  9 |   provider = "sqlite"
2025-06-10T06:49:56.07017794Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:49:56.070180851Z    | 
2025-06-10T06:49:56.070183391Z 
2025-06-10T06:49:56.070186301Z Validation Error Count: 1
2025-06-10T06:49:56.070189361Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:49:56.070204622Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:49:56.070208223Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:49:56.070210933Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:49:56.070213913Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:49:56.070217134Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:49:56.070219754Z   clientVersion: '6.9.0',
2025-06-10T06:49:56.070222284Z   errorCode: undefined,
2025-06-10T06:49:56.070247476Z   retryable: undefined
2025-06-10T06:49:56.070250196Z }
2025-06-10T06:49:56.07065427Z 10.219.27.208 - - [10/Jun/2025:06:49:56 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:06.07076485Z prisma:error 
2025-06-10T06:50:06.070793812Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:06.070797902Z 
2025-06-10T06:50:06.070801483Z 
2025-06-10T06:50:06.070805223Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:06.070808903Z   -->  schema.prisma:10
2025-06-10T06:50:06.070812734Z    | 
2025-06-10T06:50:06.070816834Z  9 |   provider = "sqlite"
2025-06-10T06:50:06.070820684Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:06.070824395Z    | 
2025-06-10T06:50:06.070827875Z 
2025-06-10T06:50:06.070831505Z Validation Error Count: 1
2025-06-10T06:50:06.070909722Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:50:06.070925413Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:06.070930143Z 
2025-06-10T06:50:06.070934304Z 
2025-06-10T06:50:06.070939084Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:06.070943394Z   -->  schema.prisma:10
2025-06-10T06:50:06.070947965Z    | 
2025-06-10T06:50:06.070952455Z  9 |   provider = "sqlite"
2025-06-10T06:50:06.070956695Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:06.070960956Z    | 
2025-06-10T06:50:06.070964896Z 
2025-06-10T06:50:06.070968967Z Validation Error Count: 1
2025-06-10T06:50:06.070973537Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:50:06.070977887Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:50:06.070982758Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:50:06.070986988Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:50:06.070991078Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:50:06.070995339Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:50:06.070999629Z   clientVersion: '6.9.0',
2025-06-10T06:50:06.07100373Z   errorCode: undefined,
2025-06-10T06:50:06.07100756Z   retryable: undefined
2025-06-10T06:50:06.07101185Z }
2025-06-10T06:50:06.071452607Z 10.219.27.208 - - [10/Jun/2025:06:50:06 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:16.07022404Z prisma:error 
2025-06-10T06:50:16.070269274Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:16.070273084Z 
2025-06-10T06:50:16.070275605Z 
2025-06-10T06:50:16.070278895Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:16.070281875Z   -->  schema.prisma:10
2025-06-10T06:50:16.070284445Z    | 
2025-06-10T06:50:16.070287915Z  9 |   provider = "sqlite"
2025-06-10T06:50:16.070291096Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:16.070293956Z    | 
2025-06-10T06:50:16.070296266Z 
2025-06-10T06:50:16.070299086Z Validation Error Count: 1
2025-06-10T06:50:16.070316578Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:50:16.070320808Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:16.070323218Z 
2025-06-10T06:50:16.070325418Z 
2025-06-10T06:50:16.070327869Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:16.070330239Z   -->  schema.prisma:10
2025-06-10T06:50:16.070332969Z    | 
2025-06-10T06:50:16.070335829Z  9 |   provider = "sqlite"
2025-06-10T06:50:16.07033854Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:16.07034113Z    | 
2025-06-10T06:50:16.07034325Z 
2025-06-10T06:50:16.07034552Z Validation Error Count: 1
2025-06-10T06:50:16.07034918Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:50:16.070352071Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:50:16.070355151Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:50:16.070357741Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:50:16.070360212Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:50:16.070363242Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:50:16.070365672Z   clientVersion: '6.9.0',
2025-06-10T06:50:16.070368322Z   errorCode: undefined,
2025-06-10T06:50:16.070371092Z   retryable: undefined
2025-06-10T06:50:16.070373842Z }
2025-06-10T06:50:16.070864773Z 10.219.27.208 - - [10/Jun/2025:06:50:16 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:26.072177701Z prisma:error 
2025-06-10T06:50:26.072202433Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:26.072206453Z 
2025-06-10T06:50:26.072210204Z 
2025-06-10T06:50:26.072214564Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:26.072219414Z   -->  schema.prisma:10
2025-06-10T06:50:26.072223155Z    | 
2025-06-10T06:50:26.072227485Z  9 |   provider = "sqlite"
2025-06-10T06:50:26.072231285Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:26.072234976Z    | 
2025-06-10T06:50:26.072238346Z 
2025-06-10T06:50:26.072241696Z Validation Error Count: 1
2025-06-10T06:50:26.072840306Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:50:26.072852147Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:26.072856357Z 
2025-06-10T06:50:26.072860377Z 
2025-06-10T06:50:26.072938744Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:26.072946445Z   -->  schema.prisma:10
2025-06-10T06:50:26.072950345Z    | 
2025-06-10T06:50:26.072955525Z  9 |   provider = "sqlite"
2025-06-10T06:50:26.072959826Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:26.07300835Z    | 
2025-06-10T06:50:26.07301122Z 
2025-06-10T06:50:26.07301373Z Validation Error Count: 1
2025-06-10T06:50:26.07301714Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:50:26.073019951Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:50:26.073022651Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:50:26.073025301Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:50:26.073027421Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:50:26.073030321Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:50:26.073033522Z   clientVersion: '6.9.0',
2025-06-10T06:50:26.073036162Z   errorCode: undefined,
2025-06-10T06:50:26.073038432Z   retryable: undefined
2025-06-10T06:50:26.073040922Z }
2025-06-10T06:50:26.073120529Z 10.219.27.208 - - [10/Jun/2025:06:50:26 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:36.071669232Z prisma:error 
2025-06-10T06:50:36.071669903Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:50:36.071699105Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:36.071703965Z 
2025-06-10T06:50:36.071708366Z 
2025-06-10T06:50:36.071712816Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:36.071717607Z   -->  schema.prisma:10
2025-06-10T06:50:36.071722067Z    | 
2025-06-10T06:50:36.071726807Z  9 |   provider = "sqlite"
2025-06-10T06:50:36.071731578Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:36.071735988Z    | 
2025-06-10T06:50:36.071740088Z 
2025-06-10T06:50:36.071744579Z Validation Error Count: 1
2025-06-10T06:50:36.071750159Z 10.219.27.208 - - [10/Jun/2025:06:50:36 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:36.0717616Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:36.071765931Z 
2025-06-10T06:50:36.071770421Z 
2025-06-10T06:50:36.071774991Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:36.071779972Z   -->  schema.prisma:10
2025-06-10T06:50:36.071784472Z    | 
2025-06-10T06:50:36.071788752Z  9 |   provider = "sqlite"
2025-06-10T06:50:36.071793293Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:36.071797663Z    | 
2025-06-10T06:50:36.071801883Z 
2025-06-10T06:50:36.071806334Z Validation Error Count: 1
2025-06-10T06:50:36.071811454Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:50:36.071816285Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:50:36.071820505Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:50:36.071825185Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:50:36.071829496Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:50:36.071834096Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:50:36.071838386Z   clientVersion: '6.9.0',
2025-06-10T06:50:36.071842967Z   errorCode: undefined,
2025-06-10T06:50:36.071854748Z   retryable: undefined
2025-06-10T06:50:36.071857328Z }
2025-06-10T06:50:46.070969562Z prisma:error 
2025-06-10T06:50:46.070997975Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:46.071001395Z 
2025-06-10T06:50:46.071003935Z 
2025-06-10T06:50:46.071007605Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:46.071010866Z   -->  schema.prisma:10
2025-06-10T06:50:46.071013126Z    | 
2025-06-10T06:50:46.071015946Z  9 |   provider = "sqlite"
2025-06-10T06:50:46.071018337Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:46.071020697Z    | 
2025-06-10T06:50:46.071023007Z 
2025-06-10T06:50:46.071025797Z Validation Error Count: 1
2025-06-10T06:50:46.071048149Z Database health check failed: PrismaClientInitializationError: 
2025-06-10T06:50:46.071052019Z Invalid `prisma.$queryRaw()` invocation:
2025-06-10T06:50:46.071054059Z 
2025-06-10T06:50:46.07105652Z 
2025-06-10T06:50:46.07105926Z error: Error validating datasource `db`: the URL must start with the protocol `file:`.
2025-06-10T06:50:46.07106223Z   -->  schema.prisma:10
2025-06-10T06:50:46.07106472Z    | 
2025-06-10T06:50:46.071067141Z  9 |   provider = "sqlite"
2025-06-10T06:50:46.071069791Z 10 |   url      = env("DATABASE_URL")
2025-06-10T06:50:46.071072881Z    | 
2025-06-10T06:50:46.071075491Z 
2025-06-10T06:50:46.071077961Z Validation Error Count: 1
2025-06-10T06:50:46.071081442Z     at Zn.handleRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:7759)
2025-06-10T06:50:46.071087652Z     at Zn.handleAndLogRequestError (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6784)
2025-06-10T06:50:46.071090923Z     at Zn.request (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:121:6491)
2025-06-10T06:50:46.071093453Z     at async l (/opt/render/project/src/backend/node_modules/@prisma/client/runtime/library.js:130:9778)
2025-06-10T06:50:46.071096303Z     at async DatabaseService.healthCheck (/opt/render/project/src/backend/dist/services/database.js:39:13)
2025-06-10T06:50:46.071099433Z     at async /opt/render/project/src/backend/dist/routes/health.js:8:27 {
2025-06-10T06:50:46.071102013Z   clientVersion: '6.9.0',
2025-06-10T06:50:46.071104393Z   errorCode: undefined,
2025-06-10T06:50:46.071106984Z   retryable: undefined
2025-06-10T06:50:46.071109724Z }
2025-06-10T06:50:46.071643478Z 10.219.27.208 - - [10/Jun/2025:06:50:46 +0000] "GET /api/health HTTP/1.1" 503 242 "-" "Render/1.0"
2025-06-10T06:50:46.244882488Z ==> Timed Out
2025-06-10T06:50:46.261865128Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys