package uy.com.karibe.rest;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import uy.com.karibe.domain.Game;

@Path("game")
public class GameService {
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getMap() {
    	String map = "";
    	
        try {
			map = Game.getMap();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
        return map;
    }
    
    @POST
    @Produces(MediaType.TEXT_PLAIN)
    public String saveIt() {
        return "Partida guardada";
    }
}
