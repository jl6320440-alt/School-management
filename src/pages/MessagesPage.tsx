import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as kv from "../utils/backend/api";
import { Message } from "../types";

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage?: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "user1",
      name: "John Doe",
      role: "Student",
      lastMessage: "Thanks for the help!",
    },
    {
      id: "user2",
      name: "Sarah Smith",
      role: "Teacher",
      lastMessage: "See you in class",
    },
    {
      id: "user3",
      name: "Mike Johnson",
      role: "Parent",
      lastMessage: "How is my son doing?",
    },
  ]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const loadMessages = async (contactId: string) => {
    try {
      const messagesData = await kv.getByPrefix(
        `message:${user?.id}:${contactId}`
      );
      setMessages(
        messagesData.sort(
          (a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: `message:${user?.id}:${selectedContact.id}:${Date.now()}`,
      senderId: user?.id || "",
      receiverId: selectedContact.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      await kv.set(message.id, message);
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Messages</h1>
        <p className="text-muted-foreground mt-2">
          Communicate with teachers, students, and parents
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Contacts List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-accent transition-colors ${
                    selectedContact?.id === contact.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar>
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p>{contact.name}</p>
                    <p className="text-muted-foreground truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2">
          {selectedContact ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedContact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {selectedContact.name}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {selectedContact.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="mt-1 text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
