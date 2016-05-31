

describe("MD5 library", function() {
    
    
	it("md5 is working", function() {
		
		var res = md5("StargateIsCool");

		expect(res).toEqual("3ef6dfd0d77207da108d5e259b8d73b0");
	});
    
	
});