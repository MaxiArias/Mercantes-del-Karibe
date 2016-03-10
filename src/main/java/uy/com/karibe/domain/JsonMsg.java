/*
 * JsonMsg.java
 *
 * MDK 4.0.1 - Clase para interpretar Json recibido desde el cliente web.
 *
 * 05/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.domain;

public class JsonMsg {
	
	private String id;
	private String name;
	private String message;
	
	public JsonMsg(String id, String name, String message) {
		this.id = id;
		this.name = name;
		this.message = message;
	}
	
	public String getId(){
		return this.id;
	}
	
	public String getName(){
		return this.name;
	}
	
	public String getMessage(){
		return this.message;
	}
	
	public void setId(String id){
		this.id = id;
	}
	
	public void setName(String name){
		this.name = name;
	}
	
	public void setMessage(String message){
		this.message = message;
	}
}