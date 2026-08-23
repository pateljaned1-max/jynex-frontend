export type Role = 
  | 'Technical' 
  | 'Hiring Manager' 
  | 'Product Manager' 
  | 'Behavioural' 
  | 'Customer';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Duration = '15 min' | '30 min' | '45 min';

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}