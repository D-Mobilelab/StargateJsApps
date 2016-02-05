/**
 * Created by pasquale on 01/02/16.
 */
function isRunningOnIos(){
    return window.device.platform.toLowerCase() == "ios";
}

function isRunningOnAndroid(){
    return window.device.platform.toLowerCase() == "android";
}
describe("Stargate.Game module tests", function() {
    var game = stargatePublic.Game;

    beforeEach(function() {
    });

    it("game should exists", function() {
        expect(game).toBeDefined();
    });
});
