/**
 * Created by pasquale on 01/02/16.
 */
function isRunningOnIos(){
    return window.device.platform.toLowerCase() == "ios";
}

function isRunningOnAndroid(){
    return window.device.platform.toLowerCase() == "android";
}
describe("Game module tests", function() {
    beforeEach(function() {


    });

    it("game should exists", function() {
        expect(game).toBeDefined();
    });
});
