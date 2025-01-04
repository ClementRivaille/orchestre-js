var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var BufferLoader = /** @class */ (function () {
    /**
     * context {object} Audio context
     * soundsUrls {array} List of objects contening name and urls of sounds
     */
    function BufferLoader(context) {
        this.context = context;
        this.buffers = {};
    }
    /**
     * Load a sound from url
     */
    BufferLoader.prototype.load = function (name, url) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, buffer, audioData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new Request(url);
                        return [4 /*yield*/, fetch(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        buffer = _a.sent();
                        return [4 /*yield*/, this.context.decodeAudioData(buffer)];
                    case 3:
                        audioData = _a.sent();
                        this.buffers[name] = audioData;
                        return [2 /*return*/, audioData];
                }
            });
        });
    };
    /**
     * Load a list of sounds
     */
    BufferLoader.prototype.loadAll = function (sounds) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _i, sounds_1, soundUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (_i = 0, sounds_1 = sounds; _i < sounds_1.length; _i++) {
                            soundUrl = sounds_1[_i];
                            promises.push(this.load(soundUrl.name, soundUrl.url));
                        }
                        // Return buffers in an object
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        // Return buffers in an object
                        _a.sent();
                        return [2 /*return*/, this.buffers];
                }
            });
        });
    };
    return BufferLoader;
}());
export default BufferLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9idWZmZXItbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtBO0lBRUU7OztPQUdHO0lBQ0gsc0JBQW9CLE9BQXFCO1FBQXJCLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFMekMsWUFBTyxHQUFtQyxFQUFFLENBQUM7SUFLRCxDQUFDO0lBRTdDOztPQUVHO0lBQ0csMkJBQUksR0FBVixVQUFXLElBQVksRUFBRSxHQUFXOzs7Ozs7d0JBRTVCLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFHaEIscUJBQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFBOzt3QkFBL0IsUUFBUSxHQUFHLFNBQW9CO3dCQUN0QixxQkFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUFyQyxNQUFNLEdBQUcsU0FBNEI7d0JBRXpCLHFCQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBdEQsU0FBUyxHQUFHLFNBQTBDO3dCQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQzt3QkFFL0Isc0JBQU8sU0FBUyxFQUFDOzs7O0tBQ2xCO0lBRUQ7O09BRUc7SUFDRyw4QkFBTyxHQUFiLFVBQWMsTUFBZTs7Ozs7O3dCQUNyQixRQUFRLEdBQUcsRUFBRSxDQUFDO3dCQUNwQixXQUEyQixFQUFOLGlCQUFNLEVBQU4sb0JBQU0sRUFBTixJQUFNLEVBQUUsQ0FBQzs0QkFBckIsUUFBUTs0QkFDZixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDeEQsQ0FBQzt3QkFFRCw4QkFBOEI7d0JBQzlCLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUQzQiw4QkFBOEI7d0JBQzlCLFNBQTJCLENBQUM7d0JBQzVCLHNCQUFPLElBQUksQ0FBQyxPQUFPLEVBQUM7Ozs7S0FDckI7SUFDSCxtQkFBQztBQUFELENBQUMsQUF0Q0QsSUFzQ0M7QUFFRCxlQUFlLFlBQVksQ0FBQyJ9