import java.util.HashMap;

public class IDandPassword {
	HashMap<String,String> logininfo = new HashMap<String,String>();
	
	IDandPassword(){
		logininfo.put("Bro","pizza");
		logininfo.put("Brometheus","PASSWORD");
		logininfo.put("azrael","pass");
	}
	
	protected HashMap getLoginInfo(){
		return logininfo;
	}
}
