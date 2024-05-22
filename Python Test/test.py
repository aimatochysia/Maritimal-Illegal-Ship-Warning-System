def read_geojson_coordinates(filename):
    coordinates = []
    with open(filename, 'r') as file:
        line = file.readline()
    return line

def find_substring_end(main_string, substring):
    # Find the starting index of the substring
    start_index = main_string.find(substring)
    if start_index == -1:
        return -1
    end_index = start_index + len(substring) - 1
    return end_index

def parse_nested_structure(s):
    def parse_from_index(index):
        stack = []
        current = []
        number = ''
        
        while index < len(s):
            char = s[index]
            
            if char == '[':
                if number:
                    current.append(float(number))
                    number = ''
                stack.append(current)
                current = []
            elif char == ']':
                if number:
                    current.append(float(number))
                    number = ''
                if stack:
                    last = stack.pop()
                    last.append(current)
                    current = last
                else:
                    break
            elif char == ',':
                if number:
                    current.append(float(number))
                    number = ''
            elif char.isdigit() or char == '.':
                number += char
            
            index += 1
        
        return current[0] if current else current
    
    return parse_from_index(0)

# Example usage
nested_string = '[[[1.1,2.2]],[3.3,4.4]]'
result = parse_nested_structure(nested_string)
print(result)  # Output: [[[1.1, 2.2]], [3.3, 4.4]]


def print_coordinates(coordinates):
    for coord_list in coordinates:
        for coord_pair in coord_list:
            print(','.join(coord_pair))  # Join coordinate pair elements with commas
        print()  # Separate coordinate lists by a blank line

filename = 'layer-reference-geometry/geometry.geojson'
lines = read_geojson_coordinates(filename)
coordinates = get_coordinates(lines, "coordinates")
print_coordinates(coordinates)
