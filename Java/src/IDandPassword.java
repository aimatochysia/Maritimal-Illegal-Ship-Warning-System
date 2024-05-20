import java.util.HashMap;

public class IDandPassword {
	HashMap<String,String> logininfo = new HashMap<String,String>();
	
	IDandPassword(){
		logininfo.put("admin","admin");
		logininfo.put("user","password");
		logininfo.put("azrael","pass");
	}
	
	protected HashMap getLoginInfo(){
		return logininfo;
	}
}
